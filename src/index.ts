import Logger from './log';
import Database from './database';
import Web from './web';

// Export Const
export let log: Logger;
export let db: Database;

/**
 * Main File
 */
class Muchas {
    Log: Logger;
    Database: Database;
    Web: Web;

    /**
     * Creates an instance of Muchas.
     * @memberof Muchas
     */
    constructor() {
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

        log = this.Log;

        // Database
        if (DATABASE_URI) {
            this.Database = new Database({
                uri: DATABASE_URI,
            });

            db = this.Database;
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
            log.debug('Starting database');

            await this.Database.connect();

            log.debug('Database started');


        } catch (error) {
            this.Log.error(error.message || error);
        }
    }
};

if (require.main === module) {
    (async () => await new Muchas().init())();
}
