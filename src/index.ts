import yamlEnv from './libs/yamlEnv';
import Logger from './log';
import Database from './database';
import Web from './web';

/**
 * Main File
 */
class Muchas {
    Log: Logger;
    Database: Database;
    Web: Web;
    Config: {};

    /**
     * Creates an instance of Muchas.
     * @memberof Muchas
     */
    constructor() {
        // Loading configuration
        this.Config = yamlEnv();

        const {
            LOGGER_ELASTIC_HOST,
            LOGGER_ELASTIC_LEVEL,
            DATABASE_URI
        } = process.env;

        // Logger
        this.Log = new Logger({
            elastic: {
                host: LOGGER_ELASTIC_HOST,
                level: LOGGER_ELASTIC_LEVEL || 'debug'
            }
        });

        // Database
        if (DATABASE_URI) {
            this.Database = new Database({
                uri: DATABASE_URI,
            });
        }

        // Web
        this.Web = new Web({
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
            this.Log.debug('Starting database');

            await this.Database.connect();

            this.Log.debug('Database started');


        } catch (error) {
            this.Log.error(error.message || error);
        }
    }
};

const instance: Muchas = new Muchas();

export = instance;
