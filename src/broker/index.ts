import amqplib, { Connection, Channel } from 'amqplib';
import uniqid from 'uniqid';

export interface Task {
    queue: string;
    exchange: string;
    routeKey: string;
    type?: string;
    prefetch?: number;
    options?: {[x: string]: any};
    action(payload: any, done: Done): any;
}

interface RPC {
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
    (exchange: string, routeKey: string, message: string, options?: any): void;
}

export default class Broker implements BrokerOptions {
    host?: string;
    ch: Channel;
    con: Connection;
    running: number = 0;

    /**
     * Creates an instance of Tasks.
     * @param {BrokerOptions} options
     * @memberof Tasks
     */
    constructor(options: BrokerOptions) {
        this.host = options.host;
    }

    /**
     *
     *
     * @returns {Promise<any>}
     * @memberof Tasks
     */
    start(): Promise<any> {
        return new Promise((resolve, reject): void => {
            try {
                amqplib.connect(`amqp://${this.host}`).then((con): any => {
                    return con.createChannel().then((ch): void => {
                        this.ch = ch;
                        this.con = con;
                        resolve(this);
                    }).catch((ee): void => {
                        reject(ee);
                    });
                }).catch((e): void => {
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
    send(exchange: string, routeKey: string, message: string, options: any = {}): any {
        // if (!this.enabled) throw Error('Tasks feature is not enabled');
        // const trans = apm.startTransaction(`${exchange} - ${routeKey}`, 'Rabbit');

        // Check if it's an object, if true convert to json
        const parsedMsg = (
            typeof message === 'object' && !Array.isArray(message)) ? JSON.stringify(message) : message;
        this.ch.assertExchange(exchange, options.type || 'direct', { durable: true });

        // Sends the message to the queue
        const status = this.ch.publish(exchange, routeKey, Buffer.from(parsedMsg));
        // trans.end();
        return status;
    }

    async sendRPC(): Promise<void> {
        const ch = await this.con.createChannel();
        const q = await ch.assertQueue('', { exclusive: true });
        const uid = uniqid();

        // Wait the reply here
        ch.consume(q.queue, function(msg): void {
            if (msg.properties.correlationId == uid) {
                console.log(' [.] Got %s', msg.content.toString());
            }
        }, {
            noAck: true
        });

        // Send the message
        ch.sendToQueue('rpc_queue',
            Buffer.from('num.toString()'),{
                correlationId: uid,
                replyTo: q.queue });
    }

    async bindRPC(rpc: RPC): Promise<void> {
        const ch = await this.con.createChannel();
        await ch.assertQueue(rpc.queue, { durable: false });
        ch.consume(rpc.queue, function(msg): void {
            rpc.action(msg, (reply): void => {
                ch.sendToQueue(msg.properties.replyTo,
                    Buffer.from(reply.toString()), {
                        correlationId: msg.properties.correlationId
                    });
            });

            ch.ack(msg);
        });
    }

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
            ch.assertExchange(task.exchange, task.type || 'direct', exchangeOptions);
            // Assert that the queue exists
            ch.assertQueue(task.queue);
            // Bind the queue in the exchange by the routing key
            ch.bindQueue(task.queue, task.exchange, task.routeKey);

            // Consumes it
            const consumerTag = `${Date.now()}${process.pid}${Math.random()}`;

            ch.consume(task.queue, (msg: any): void => {
                // counter.taskUp();
                try {
                // Check if APM is enabled to track the transaction
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
                    task.action(parsedMsg, (nack: any, requeue = true, allUpTo = false): void => {
                    // Check if APM is enabled to end the trasaction treacking
                        if (typeof nack !== 'undefined') {
                            ch.nack(msg, allUpTo, requeue);
                            return;
                        }

                        // Sends the ack to the message at Rabbit
                        ch.ack(msg);
                    });
                } catch (e) {
                //   counter.taskDown();
                }
            }, {
                consumerTag,
            });
            // counter.consumerTags.push({ consumerTag, ch });
        } catch (e) {
            console.log(e);
        }
    }
}

export { BrokerOptions, BrokerSend };
