import express from 'express';

class Rest {
    /**
     * Express application instance
     */
    app: express.Express;
    /**
     * HTTP server port
     */
    port: number = 8000;

    constructor() {
        this.app = express();

    }

    start(): Promise<express.Express> {
        return new Promise((r, rj) => {
            try {
                this.app.listen(this.port, () => { r(); });
            } catch(e) {
                rj(e);
            }
        });
    }
}

export { Rest };