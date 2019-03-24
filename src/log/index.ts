import Winston from 'winston';
import uniqid from 'uniqid';

class Log {
    logger = Winston;

    constructor() {

    };

    /**
     *
     */
    private errorId(): string {
        return uniqid();
    };

    /**
     *
     * @param message
     * @param errorCode
     * @param meta
     */
    error(message: string, errorCode?: string, meta?: {}): string {
        const uid = this.errorId();
        this.logger.error(message, {
            uid,
            errorCode,
            ...meta,
        })
        return uid;
    };
};

export = Log;