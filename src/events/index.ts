import amqplib from 'amqplib';

interface TasksOptions {
    enabled?: boolean;
    host?: string;
}

interface TaskSend {
    (exchange: string, routeKey: string, message: string, options?: any): void;
}

export class Tasks implements TasksOptions {
    enabled?: boolean;
    host?: string;
    ch: any;
    con: any;
    running: number = 0;
    constructor(options: TasksOptions) {
        this.enabled = options.enabled;
        this.host = options.host;
    }
    start(): any {
        return new Promise((resolve, reject): void => {
            if (!this.enabled) return resolve();
            try {
                amqplib.connect(`amqp://${this.host}`).then((con): void => {
                    con.createChannel().then((ch): void => {
                        this.ch = ch;
                        this.con = con;
                        return resolve(this);
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

    /* Send message to exchange abstraction */
    send(exchange: string, routeKey: string, message: string, options: any = {}): TaskSend {
        if (!this.enabled) throw Error('Tasks feature is not enabled');
        const trans = apm.startTransaction(`${exchange} - ${routeKey}`, 'Rabbit');

        // Check if it's an object, if true convert to json
        const parsedMsg = (
            typeof message === 'object' && !Array.isArray(message)) ? JSON.stringify(message) : message;
        this.ch.assertExchange(exchange, options.type || 'direct', { durable: true });

        // Sends the message to the queue
        const status = this.ch.publish(exchange, routeKey, Buffer.from(parsedMsg));
        trans.end();
        return status;
    }
}

export { TasksOptions, TaskSend };
