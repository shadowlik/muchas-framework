import amqplib, { Connection, Channel } from 'amqplib';
import uniqid from 'uniqid';
import MuchasEvents from '../Events';

export interface Task {
    queue: string;
    exchange: string;
    routeKey: string;
    type?: string;
    prefetch?: number;
    options?: { [x: string]: any };
    action(payload: any, done: Done): any;
}

export interface RPC {
    queue: string;
    action(payload: any, done: DoneRPC): any;
}

interface Done {
    (nack?: any, requeue?: boolean, allUpTo?: boolean): void;
}

interface DoneRPC {
    (reply?: any): void;
}

interface BrokerOptions {
    host?: string;
}

interface BrokerSend {
    (exchange: string, routeKey: string, message: string | { [x: string]: any }, options?: any): void;
}

export default class Broker implements BrokerOptions {
    host?: string;
    ch: Channel;
    con: Connection;
    running: number = 0;
    consumerTags: any[] = [];
    apm: any;

    /**
     * Creates an instance of Tasks.
     * @param {BrokerOptions} options
     * @memberof Tasks
     */
    constructor(options: BrokerOptions, Apm?: any) {
        this.host = options.host;
        this.apm = Apm;
    }

    /**
                  * Start the broker
                  *
                  * @returns {Promise<any>}
                  * @memberof Tasks
                  */
    start(): Promise<any> {
        return new Promise((resolve, reject): void => {
            try {
                MuchasEvents.debug("Starting broker");

                amqplib
                    .connect(`amqp://${this.host}`)
                    .then((con): any => {
                        return con
                            .createChannel()
                            .then((ch): void => {
                                this.ch = ch;
                                this.con = con;

                                MuchasEvents.debug("Broker started");

                                resolve(this);
                            })
                            .catch((ee): void => {
                                reject(ee);
                            });
                    })
                    .catch((e): void => {
                        reject(e);
                    });
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
                  * Send message
                  *
                  * @param {string} exchange
                  * @param {string} routeKey
                  * @param {string} message
                  * @param {*} [options={}]
                  * @returns {*}
                  * @memberof Tasks
                  */
    async send(
        exchange: string,
        routeKey: string,
        message: string,
        options: { [x: string]: any; skipAssert?: boolean } = {}
    ): Promise<any> {
        // if (!this.enabled) throw Error('Tasks feature is not enabled');
        // const trans = apm.startTransaction(`${exchange} - ${routeKey}`, 'Rabbit');

        // Check if it's an object, if true convert to json
        const parsedMsg =
                     typeof message === "object" && !Array.isArray(message)
                         ? JSON.stringify(message)
                         : message;
        if (!options.skipAssert) {
            await this.ch.assertExchange(
                exchange,
                options.type || "direct",
                { durable: true }
            );
        }
        // Sends the message to the queue
        const status = this.ch.publish(
            exchange,
            routeKey,
            Buffer.from(parsedMsg),
            (options as unknown) as any
        );
        // trans.end();
        return status;
    }

    /**
                  * Send RPC request
                  *
                  * @param {string} queue
                  * @param {*} message
                  * @returns {Promise<any>}
                  * @memberof Broker
                  */
    async rpc(queue: string, message: any): Promise<any> {
        return new Promise(
            async (resolve, reject): Promise<any> => {
                try {
                    const ch = await this.con.createChannel();
                    const q = await ch.assertQueue("", {
                        exclusive: true,
                    });
                    const uid = uniqid();

                    // Wait the reply here
                    ch.consume(
                        q.queue,
                        function (msg): void {
                            if (msg.properties.correlationId == uid) {
                                resolve(msg.content.toString());
                            }
                        },
                        {
                            noAck: true,
                        }
                    );

                    // Send the message
                    ch.sendToQueue(
                        queue,
                        Buffer.from(message.toString()),
                        {
                            correlationId: uid,
                            replyTo: q.queue,
                        }
                    );
                } catch (error) {
                    reject(error);
                }
            }
        );
    }

    /**
                  * Bind RPC listener
                  *
                  * @param {RPC} rpc
                  * @returns {Promise<void>}
                  * @memberof Broker
                  */
    async bindRPC(rpc: RPC): Promise<void> {
        const ch = await this.con.createChannel();
        await ch.assertQueue(rpc.queue, { durable: false });
        ch.consume(rpc.queue, function (msg): void {
            // Lets threat the message
            const stringMsg = msg.content.toString();
            let parsedMsg;
            // Tries to parse to object
            try {
                parsedMsg = JSON.parse(stringMsg);
            } catch (e) {
                // If it fails send as a string
                parsedMsg = stringMsg;
            }
            rpc.action(parsedMsg, (reply): void => {
                ch.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(reply.toString()),
                    {
                        correlationId: msg.properties.correlationId,
                    }
                );
            });
            ch.ack(msg);
        });
    }

    /**
                  * Bind task
                  *
                  * @param {Task} task
                  * @returns {Promise<void>}
                  * @memberof Broker
                  */
    async bindTask(task: Task): Promise<void> {
        try {
            const ch = await this.con.createChannel();
            /* Debug */
            //   logger.debug(`Loading task ${task.exchange}/${task.queue}`, '');

            // TODO: Make each task a channel for better use of the prefetch
            ch.prefetch(task.prefetch || 1);

            /* Listen to messages in the queue abstraction */
            // Assert that this exchange exists
            task.options = task.options || {};
            const exchangeOptions = { durable: true, ...task.options };
            ch.assertExchange(
                task.exchange,
                task.type || "direct",
                exchangeOptions
            );
            // Assert that the queue exists
            ch.assertQueue(task.queue);
            // Bind the queue in the exchange by the routing key
            ch.bindQueue(task.queue, task.exchange, task.routeKey);

            // Consumes it
            const consumerTag = `${Date.now()}${
                process.pid
            }${Math.random()}`;

            ch.consume(
                task.queue,
                (msg: any): void => {
                    this.running += 1;
                    try {
                        // Check if APM is enabled to track the transaction
                        let trans: any;
                        if (this.apm)
                            trans = this.apm.startTransaction(
                                task.queue,
                                "messages"
                            );
                        // const apmTransaction = apm.startTransaction(task.queue, 'Tasks');

                        // Lets threat the message
                        const stringMsg = msg.content.toString();
                        let parsedMsg;
                        // Tries to parse to object
                        try {
                            parsedMsg = JSON.parse(stringMsg);
                        } catch (e) {
                            // If it fails send as a string
                            parsedMsg = stringMsg;
                        }
                        /**
                            * We send back to the user only a callback with the payload content and a done fuction
                            * so he can ack the message and possibly end the transaction.
                            * @return {type} Description.
                            */
                        task.action(
                            parsedMsg,
                            (
                                nack: any,
                                requeue = true,
                                allUpTo = false
                            ): void => {
                                this.running -= 1;
                                if (typeof nack !== "undefined") {
                                    ch.nack(msg, allUpTo, requeue);
                                    if (this.apm && trans) trans.end();
                                    return;
                                }

                                // Sends the ack to the message at Rabbit
                                ch.ack(msg);
                                if (this.apm && trans) trans.end();
                            }
                        );
                    } catch (e) {
                        this.running -= 1;
                    }
                },
                {
                    consumerTag,
                }
            );
            this.consumerTags.push({ consumerTag, ch });
        } catch (e) {
            console.log(e);
        }
    }

    /**
                  * Graceful Stop
                  *
                  * @returns {Promise<void>}
                  * @memberof Broker
                  */
    stop(): Promise<void> {
        return new Promise(
            async (resolve: any, reject): Promise<void> => {
                console.log("[Tasks] Stopping and closing tasks...");

                // Close the channel so we won't recieve any more tasks
                this.consumerTags.forEach(
                    async ({ consumerTag, ch }): Promise<void> => {
                        await ch.cancel(consumerTag);
                    }
                );

                // Loop interval until all tasks are finished
                const s = setInterval(async (): Promise<void> => {
                    if (this.running > 0) {
                        console.log(`[Tasks] Waiting ${this.running}...`);
                        return;
                    }

                    // Disable Tasks
                    await this.con.close();

                    console.log(
                        "[Tasks] Stopped and connection is closed!"
                    );
                    resolve(clearInterval(s));
                }, 5000);
            }
        );
    }
}

export { BrokerOptions, BrokerSend };