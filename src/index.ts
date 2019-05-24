import yamlEnv from './libs/YamlEnv';
import Logger, { LogOptions } from './log';
import apm from './Apm';

const config = yamlEnv(process.env.MUCHASYML || undefined);

const Apm: any = apm(config.name, config.env, config.apm);

// Database and Models
import Database from './database/Database';
import ModelsLoader from './database/Models';
export { Schema, Model, Document, Query } from 'mongoose';

// Routines
import Routine from './routine/Routine';
import RoutineLoader from './routine/RoutineLoader';
export { Routine };

// Components
import Component from './component/Component';
import ComponentsLoader from './component/ComponentLoader';
export { Component };

// Broker
import Broker, { Task, RPC } from './broker/Broker';
export { Task, RPC };

// Web
import Web from './web/Server';
import Route from './web/Route';
export { Route };

// Health
import Health from './Health';
import MuchasEvents from './Events';
import Plugins from './Plugins';

/**
 * Main File
 */
class Muchas {
    log: Logger | Console;
    database: Database;
    web: Web
    RoutineLoader: RoutineLoader;
    broker: Broker;
    healthServer: Health;
    // eslint-disable-next-line
    config: { [x: string]: any }
    apm: any;

    /**
     * Creates an instance of Muchas.
     * @memberof Muchas
     */
    constructor() {
        // Loading configuration
        this.config = config;

        if (Apm) {
            this.apm = Apm;
        }
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
            port: this.config.health.port || 9000,
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
        if(this.config.web) {
            this.web = new Web({
                port: this.config.web.port,
                headers: this.config.web.headers
            });
        }

        // Routines
        if(this.config.database) {
            this.RoutineLoader = new RoutineLoader({
                mongoConString: this.config.database.uri || null,
                web: this.web,
            });
        }

        // Console via event
        MuchasEvents.events.on('debug', (message: string): void => {
            this.log.debug(message);
        });

        // Bind the graceful shutdown
        process.on('SIGTERM', this.shutdown);
        process.on('SIGINT' , this.shutdown);
    };

    /**
     * Starts the framework
     *
     * @returns {Promise<void>}
     * @memberof Muchas
     */
    async init (): Promise<void> {
        try {
            this.log.debug('Starting application');

            // Health
            if (this.healthServer) await this.healthServer.start();

            // Database
            if (this.database) {
                await this.database.connect();

                // Load models
                const modelsLoader = await new ModelsLoader(this.config.database.model.path || 'dist/models').load();

                // Add the model to the mongoose instance
                Object.keys(modelsLoader.models).forEach((modelName): void => this.database.addModel(modelName, modelsLoader.models[modelName]));
            }

            // Broker
            if (this.broker) await this.broker.start();

            // Webserver
            if (this.web) await this.web.start();

            // Plugins
            await new Plugins(this.config.plugins || './dist/plugins').start();

            // Components
            await new ComponentsLoader({
                path: this.config.components.path || './dist/components',
                web: this.web || false,
                broker: this.broker || false,
                routine: this.RoutineLoader || false,
            }).load();

            // Application is up and running
            this.healthServer.live();

            this.log.debug('Application is live');
        } catch (error) {
            this.log.error(error.message || error);
            // Application is up and running
            this.healthServer.down();
            if (this.config.env === 'production') {
                process.exit(1);
            }
        };
    };

    /**
     * Graceful shutdown
     *
     * @returns {Promise<void>}
     * @memberof Muchas
     */
    async shutdown(): Promise<void> {
        if (this.web) await this.web.stop();
        if (this.RoutineLoader) await this.RoutineLoader.stop();
        if (this.broker) await this.broker.stop();
        if (this.healthServer) this.healthServer.down();
    }
};

const muchas = new Muchas();

export default muchas;

export const log = muchas.log;