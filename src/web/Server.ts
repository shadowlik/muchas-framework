import express, { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

import MuchasEvents from '../Events';
import { Server } from 'http';

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
    headers?: Header[];
    secret?: string;
}

class Web {
    app: CustomExpress;
    port: number = 8000;
    headers: {[x: string]: any} = {};
    secret: string = '123456789';
    enabled: boolean = false;
    server: Server;

    /**
     * Creates an instance of Web.
     * @param {Options} options
     * @memberof Web
     */
    constructor(options?: Options) {
        this.app = express();

        this.app.use(bodyParser.json());

        if(options.secret) this.secret = options.secret;
        if(options.port) this.port = options.port;
        if(options.headers) this.headers = options.headers || [];

        this.options();
    }

    /**
     * Starts the Web Server
     *
     * @returns {Promise<{ server: Server; app: express.Express }>}
     * @memberof Web
     */
    start(): Promise<{ server: Server; app: express.Express }> {
        return new Promise((resolve, reject): void => {
            MuchasEvents.debug('Starting web server');
            try {
                this.server = this.app.listen(this.port, (): void => {
                    MuchasEvents.debug(`Web server started on port ${this.port}`);

                    resolve({
                        server: this.server,
                        app: this.app,
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
    options(): void {
        this.app.options("/*", (req, res, next): void => {
            Object.keys(this.headers).forEach((key: string): void => {
                const header: Header = this.headers[key];
                res.set(key, header as unknown as string);
            });
            next();
        })
    }

    /**
     * Set express base headers
     *
     * @private
     * @param {express.Request} req
     * @param {express.Response} res
     * @param {express.NextFunction} next
     * @memberof Web
     */
    private setHeaders(): Function {
        return (req: Request, res: Response, next: NextFunction): void => {
            Object.keys(this.headers).forEach((key: string): void => {
                const header: Header = this.headers[key];
                res.set(key, header as unknown as string);
            });
            next();
        }
    }

    /**
     * 403 errors handler
     *
     * @private
     * @memberof Web
     */
    private _403 = (res: express.Response): express.Response => res.status(403).json({
        error: {
            code: 403,
            message: 'Not authorized',
        },
    });

    /**
     * Secure route middleware
     * @param req
     * @param res
     * @param next
     */
    protected secureRouteMiddleware(): Function {
        // Route is secure, check the bearer token
        return (req: RequestPrivate, res: express.Response, next: express.NextFunction): void => {
            const { authorization } = req.headers;
            if (!authorization || authorization.indexOf('Bearer ') === -1) {
                this._403(res);
                return;
            }

            const token = authorization.replace('Bearer ', '');

            jwt.verify(token, this.secret, (error, decoded): void => {
                req.token = decoded as object;
                next();
            });
        }
    }

    /**
     * Add route
     * @param method
     * @param path
     * @param controller
     * @param secure
     */
    addRoute(method: string, path: string, controller: Function, secure: boolean = false): void {
        // Secure routes
        if (secure) {
            this.app[method](path, this.setHeaders(), this.secureRouteMiddleware(), controller);
            return;
        }
        // Public routes
        this.app[method](path, this.setHeaders(), controller);
    };
}

export default Web;