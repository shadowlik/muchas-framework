import Winston from 'winston';
import uniqid from 'uniqid';
import TransportStream from 'winston-transport'
import { ElasticLogger, ElasticLoggerOptions } from './elastic';
import { ConsoleLogger } from './console';
import { type } from 'os';

interface Meta {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [x: string]: any;
}

/**
 * @interface LogOptions
 */
export interface LogOptions {
    /**
     * @type {ElasticLoggerOptions}
     * @memberof LogOptions
     */
    elastic?: ElasticLoggerOptions;
}

class Log {
    [x: string]: any;
    private logger = Winston;
    private console: ConsoleLogger;
    private elastic: ElasticLogger;

    constructor(options: LogOptions) {
        const {
            elastic,
        } = options;

        if(elastic && elastic.host && elastic.level) {
            this.elastic = new ElasticLogger(
                elastic.host,
                elastic.level,
            );

            this.logger.add(this.elastic.transport(elastic.level,`logs-${elastic.indexPrefix || 'devapp'}`) as unknown as TransportStream);
        };

        if (process.env.NODE_ENV !== 'production') {
            this.console = new ConsoleLogger('debug');
            this.logger.add(this.console.transport());
        }
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
    public error(error: Error, meta?: Meta): string;
    public error(message: string, error: Error, meta?: Meta): string;

    public error(arg0: Error|string, arg1: Error|Meta, arg2? : Meta): string {
        const uid = this.errorId();
        
        let message;
        let stack;
        let errorMessage;
        let meta;

        if (typeof arg0 === 'string') {
            message = arg0;
            stack = arg1.stack;
            errorMessage = arg1.message;
            meta = arg2;
        } else {
            message = arg0.message;
            stack = arg0.stack;
            errorMessage = arg0.message;
            meta = arg1;
        }

        this.logger.error(message, {
            uid,
            error: {
                stack,
                message: errorMessage,
            },
            ...meta
        });

        return uid;
    };

    /**
     * Warn level logger
     *
     * @param message Human readable message
     * @param meta Any metadata relevant to the log
     */
    warn(message: string, meta?: Meta): void { this.logger.warn(message, meta); };

    /**
     * Info level logger
     *
     * @param message Human readable message
     * @param meta Any metadata relevant to the log
     */
    info(message: string, meta?: Meta): void { this.logger.info(message, meta); };

    /**
     * Verbose logger
     *
     * @param message Human readable message
     * @param meta Any metadata relevant to the log
     */
    verbose(message: string, meta?: Meta): void { this.logger.verbose(message, meta); };

    /**
     *  Debug level logger
     *
     * @param message Human readable message
     * @param meta Any metadata relevant to the log
     */
    debug(message: string, meta?: Meta): void { this.logger.debug(message, meta); };

    /**
     * Silly level logger
     *
     * @param message Human readable message
     * @param meta Any metadata relevant to the log
     */
    silly(message: string, meta?: Meta): void { this.logger.silly(message, meta); };
};

export default Log;
