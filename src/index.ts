import yamlEnv from './libs/yamlEnv';
import Logger from './log';
import Database from './database';
import Web from './web';

/**
 * Main File
 */
class Muchas {
    log: Logger;
    database: Database;
    web: Web;
    config: {};

    /**
     * Creates an instance of Muchas.
     * @memberof Muchas
     */
    constructor() {
        // Loading configuration
        this.config = yamlEnv();

        const {
            LOGGER_ELASTIC_HOST,
            LOGGER_ELASTIC_LEVEL,
            DATABASE_URI,
        } = process.env;

        // Logger
        this.log = new Logger({
            elastic: {
                host: LOGGER_ELASTIC_HOST,
                level: LOGGER_ELASTIC_LEVEL || 'debug'
            }
        });

        // Database
        if (DATABASE_URI) {
            this.database = new Database({
                uri: DATABASE_URI,
            });
        }

        // Web
        this.web = new Web({
            headers: []
        });

    };

    /**
     * Starts the framework
     *
     * @returns {Promise<void>}
     * @memberof Muchas
     */
    async init (): Promise<void> {
        try {
            // Database
            this.log.debug('Starting database');

            await this.database.connect();

            this.log.debug('Database started');

        } catch (error) {
            this.log.error(error.message || error);
        };
    };
};

export = new Muchas();