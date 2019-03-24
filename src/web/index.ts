import express from 'express';
import { Server } from 'http';

interface CustomExpress extends express.Express {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [prop: string]: any;
}

interface Header {
    property: string;
    value: string;
}

interface Options {
    port?: number;
    headers: Header[];
}

class Web {
    app: CustomExpress;
    port: number = 8000;
    headers: Header[] = [];

    constructor(options: Options) {
        this.app = express();
    }

    /**
     *
     */
    start(): Promise<{ server: Server; app: express.Express }> {
        return new Promise((resolve, reject) => {
            try {
                const server = this.app.listen(this.port, () => { resolve({
                    server,
                    app: this.app,
                }); });
            } catch(e) {
                reject(e);
            }
        });
    }

    private setHeaders(req: express.Request, res: express.Response, next: express.NextFunction): void {
        this.headers.forEach((header: Header) => {
            res.header(header.property, header.value);
        });
        next();
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    private secureRoute (secure: boolean): Function {
        if (!secure) {
            return (req: express.Request, res: express.Response, next: express.NextFunction): void => next();
        }
        // Route is secure, check the bearer token
        return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
            next();
        }
    }

    /**
     *
     * @param method
     * @param path
     * @param controller
     * @param secure
     */
    addRoute(method: string, path: string, controller: Function, secure: boolean = false): void {
        return this.app[method](path, this.setHeaders, this.secureRoute(secure), controller);
    };

}

export { Web };