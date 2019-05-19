import express, { Request, Response } from 'express';
import { Server } from 'http';

interface CustomExpress extends express.Express {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [prop: string]: any;
}

interface Options {
    port?: number;
}

class Web {
    app: CustomExpress;
    port: number = 9000;
    server: Server;
    private code: number = 503;
    private state: string = 'starting';

    /**
     * Creates an instance of Web.
     * @param {Options} options
     * @memberof Web
     */
    constructor(options?: Options) {
        this.app = express();
        if(options && options.port) this.port = options.port;
    }

    /**
     * Starts the Web Server
     *
     * @returns {Promise<{ server: Server; app: express.Express }>}
     * @memberof Web
     */
    start(): Promise<{ server: Server; app: express.Express }> {
        return new Promise((resolve, reject): void => {
            try {
                this.server = this.app.listen(this.port, (): void => { resolve({
                    server: this.server,
                    app: this.app,
                }); });

                this.app.get('/', (req: Request, res: Response): void => {
                    res.status(this.code).json({
                        pid: process.pid,
                        state: this.state,
                        code: this.code,
                    });
                });
            } catch(e) {
                reject(e);
            }
        });
    }

    /**
     * Gracefully Shutdown Server
     *
     * @returns {(Promise<void|Error>)}
     * @memberof Web
     */
    stop(): Promise<void|Error> {
        return new Promise((resolve, reject): void => {
            this.server.close((error: Error): void => {
                if (error) reject(error);
                resolve();
            });
        });
    }

    /**
     *
     *
     * @memberof Web
     */
    live(): void {
        this.state = 'up';
        this.code = 200;
    }

    /**
     *
     *
     * @memberof Web
     */
    down(): void {
        this.state = 'down'
        this.code = 503;
    }

}

export = Web;