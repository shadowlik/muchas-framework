import yamlEnv from './libs/yamlEnv';
import Logger from './log';
import Database from './database';
import Web from './web';
import Health from './health';

/**
 * Main File
 */
class Muchas {
    log: Logger;
    database: Database;
    web: Web;
    healthServer: Health;
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

        // Health
        this.healthServer = new Health();

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
            // Health
            if (this.healthServer) {
                this.log.debug('Starting');

                await this.healthServer.start();

                this.log.debug(`Health server on ${this.healthServer.port}`);
            }

            // Database
            if (this.database) {
                this.log.debug('Starting database');

                await this.database.connect();

                this.log.debug(`Database started ${this.database}`);

                // Load models
            }

            // Webserver
            if (this.web) {
                this.log.debug('Starting web server');

                await this.web.start();

                this.log.debug(`Web server started on port ${this.web.port}`);

                // Load routes

                // Healthz
            }

            // Application is up and running
            this.healthServer.live();

        } catch (error) {
            this.log.error(error.message || error);
        };
    };
};

export = new Muchas();