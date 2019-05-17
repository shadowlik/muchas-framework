import yamlEnv from './libs/yamlEnv';
import Logger, { LogOptions } from './log';

import Database from './database';
import ModelsLoader from './loader/Models';

import Broker from './broker';
import Web from './web';
import Health from './health';

import ComponentsLoader from './loader/Components';

/**
 * Main File
 */
class Muchas {
    log: Logger | Console;
    database: Database;
    web: Web;
    healthServer: Health;
    config: {[x: string]: any};
    crons: any;
    broker: Broker;

    /**
     * Creates an instance of Muchas.
     * @memberof Muchas
     */
    constructor() {
        // Loading configuration
        this.config = yamlEnv();

        // Logger
        this.log = console;
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

        // Broker
        if(this.config.broker) {
            this.broker = new Broker({
                host: this.config.broker.host
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
                await this.healthServer.start();
            }

            // Database
            if (this.database) {
                this.log.debug('Starting database');

                await this.database.connect();

                this.log.debug('Database started');

                // Load models
                this.log.debug('Loading models');

                const modelsLoader = await new ModelsLoader(this.config.database.model.path || 'dist/models').load();

                // Add the model to the mongoose instance
                Object.keys(modelsLoader.models).forEach((modelName): void => this.database.addModel(modelName, modelsLoader.models[modelName]));

                this.log.debug('Models loaded');
            }

            // Broker
            if (this.broker) {
                this.log.debug('Connection broker');

                await this.broker.start();

                this.log.debug('Broker connected');
            }

            // Webserver
            if (this.web) {
                this.log.debug('Starting web server');

                await this.web.start();

                this.log.debug(`Web server started on port ${this.web.port}`);
            }

            // Components
            this.log.debug('Loading components');

            await new ComponentsLoader({
                path: this.config.components.path || './src/components',
                web: this.web || false,
                broker: this.broker || false,
            }).load();

            this.log.debug('Components loaded');

            // Application is up and running
            this.healthServer.live();

        } catch (error) {
            this.log.error(error.message || error);
            // Application is up and running
            this.healthServer.down();
            // process.exit(1);
        };
    };
};

export = new Muchas();