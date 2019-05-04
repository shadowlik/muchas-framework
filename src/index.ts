import yamlEnv from './libs/yamlEnv';
import Logger, { LogOptions } from './log';
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
    config: {[x: string]: any};
    events: any;
    crons: any;

    /**
     * Creates an instance of Muchas.
     * @memberof Muchas
     */
    constructor() {
        // Loading configuration
        this.config = yamlEnv();

        // Logger
        if(this.config.logger) {
            let loggerConfig: LogOptions = {};

            if(this.config.logger.elasticsearch) {
                loggerConfig.elastic = {
                    host: this.config.logger.elasticsearch.host,
                    level: this.config.logger.elasticsearch.level || 'info'
                }
            }

            this.log = new Logger(loggerConfig);
        }

        // Health
        this.healthServer = new Health({
            port: this.config.health.port || null
        });

        // Database
        if(this.config.database) {
            this.database = new Database({
                uri: this.config.database.uri,
            });
        }

        // Web
        if(this.config.server) {
            this.web = new Web({
                port: this.config.server.port,
                headers: this.config.server.headers
            });
        }
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

            // Events
            if (this.events) {

                // Load events
            }

            // Crons
            if (this.crons) {

                // Load crons
            }

            // Webserver
            if (this.web) {
                this.log.debug('Starting web server');

                await this.web.start();

                this.log.debug(`Web server started on port ${this.web.port}`);

                // Load routes
            }

            // Application is up and running
            this.healthServer.live();

        } catch (error) {
            this.log.error(error.message || error);
        };
    };
};

export = new Muchas();