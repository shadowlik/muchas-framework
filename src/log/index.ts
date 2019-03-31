import Winston from 'winston';
import uniqid from 'uniqid';

interface Meta {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [x: string]: any;
}

class Log {
    logger = Winston;

    constructor() {

    };

    /**
     * Generates a unique error id
     */
    private errorId(): string {
        return uniqid();
    };

    /**
     * Error level logger
     *
     * @param message Human readable message
     * @param errorCode Error identification code
     * @param meta Any metadata relevant to the log
     */
    error(message: string, errorCode?: string, meta?: Meta): string {
        const uid = this.errorId();
        this.logger.error(message, {
            uid,
            errorCode,
            ...meta,
        });
        return uid;
    };

    /**
     * Warn level logger
     *
     * @param message Human readable message
     * @param meta Any metadata relevant to the log
     */
    warn(message: string, meta?: Meta): void {
        this.warn(message, meta);
    };

    /**
     * Info level logger
     *
     * @param message Human readable message
     * @param meta Any metadata relevant to the log
     */
    info(message: string, meta?: Meta): void {
        this.logger.info(message, meta);
    };

    /**
     * Verbose logger
     *
     * @param message Human readable message
     * @param meta Any metadata relevant to the log
     */
    verbose(message: string, meta?: Meta): void {
        this.logger.verbose(message, meta);
    };

    /**
     *  Debug level logger
     *
     * @param message Human readable message
     * @param meta Any metadata relevant to the log
     */
    debug(message: string, meta?: Meta): void {
        this.logger.debug(message, meta);
    };

    /**
     * Silly level logger
     *
     * @param message Human readable message
     * @param meta Any metadata relevant to the log
     */
    silly(message: string, meta?: Meta): void {
        this.logger.silly(message, meta);
    };

};

export = Log;