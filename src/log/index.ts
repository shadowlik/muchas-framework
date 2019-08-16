import Winston from 'winston';
import uniqid from 'uniqid';
import TransportStream from 'winston-transport'
import { ElasticLogger, ElasticLoggerOptions } from './elastic';
import { ConsoleLogger } from './console';

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
    error(message: string, errorCode?: string, uid?: string, meta?: Meta): string {
        const id = uid || this.errorId();
        this.logger.error(errorCode? `${errorCode}: ${message}` : message, {
            uid: id,
            errorCode,
            ...meta,
        });
        return id;
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
