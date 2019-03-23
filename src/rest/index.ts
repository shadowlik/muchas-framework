import express from 'express';

class Rest {
    app: express.Express;
    port: number = 8000;

    constructor() {
        this.app = express();

    }

    start(): void {
        this.app.listen(this.port);
    }
}

export { Rest };