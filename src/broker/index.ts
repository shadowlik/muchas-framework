import amqplib, { Connection, Channel } from 'amqplib';

interface TasksOptions {
    host?: string;
}

interface TaskSend {
    (exchange: string, routeKey: string, message: string, options?: any): void;
}

export default class Tasks implements TasksOptions {
    host?: string;
    ch: Channel;
    con: Connection;
    running: number = 0;

    /**
     * Creates an instance of Tasks.
     * @param {TasksOptions} options
     * @memberof Tasks
     */
    constructor(options: TasksOptions) {
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
}

export { TasksOptions, TaskSend };
