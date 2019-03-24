import express from 'express';
import jwt from 'jsonwebtoken';

import { Server } from 'http';
import { decode } from 'punycode';

interface CustomExpress extends express.Express {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [prop: string]: any;
}

interface RequestPrivate extends express.Request {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    token: { [x: string]: any };
}

interface Header {
    property: string;
    value: string;
}

interface Options {
    port?: number;
    headers: Header[];
    secret?: string;
}

class Web {
    app: CustomExpress;
    port: number = 8000;
    headers: Header[] = [];
    secret: string = '123456789';
    enabled: boolean = false;

    constructor(options: Options) {
        this.app = express();
        this.secret = options.secret;
        this.port = options.port;
        this.headers = options.headers;
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

    private _403 = (res: express.Response) => res.status(403).json({
        error: {
            code: 403,
            message: 'Not authorized',
        },
    });

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
        return (req: RequestPrivate, res: express.Response, next: express.NextFunction): void => {
            const { authorization } = req.headers;
            if (!authorization || authorization.indexOf('Bearer ') === -1) {
                this._403(res);
                return;
            }

            const token = authorization.replace('Bearer ', '');

            jwt.verify(token, this.secret, (error, decoded) => {
                req.token = decoded as object;
                next();
            });
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