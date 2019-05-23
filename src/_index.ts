import yamlEnv from './libs/YamlEnv';
import Logger, { LogOptions } from './log';
import apm from './Apm';

const config = yamlEnv(process.env.MUCHASYML || undefined);

let Apm: any;

// Config
if (config.apm) {
    try {
        Apm = apm(config.name, config.env, config.apm);
    } catch(e) {
        console.log(e);
    }
}

import * as Database from './Database';
import ModelsLoader from './Models';
import * as Routines from './routine/RoutineLoader';
import Component from './component/Component';
import Broker from './broker/Broker';
import Web from './web/Server';
import Health from './Health';
import MuchasEvents from './Events';
import Plugins from './Plugins';

export { Database, Component, Routines }


/**
 * Main File
 */
class Muchas {
    log: Logger | Console;
    database: Database.default;
    web: Web
    routines: Routines.RoutineLoader;
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
            this.database = new Database.default({
                uri: this.config.database.uri,
            });
        }

        // Routines
        if(this.config.database) {
            this.routines = new Routines.RoutineLoader({
                mongoConString: this.config.database.uri || null,
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
            if (this.healthServer) {
                await this.healthServer.start();
            }

            // Database
            if (this.database) {
                await this.database.connect();

                // Load models
                const modelsLoader = await new ModelsLoader(this.config.database.model.path || 'dist/models').load();

                // Add the model to the mongoose instance
                Object.keys(modelsLoader.models).forEach((modelName): void => this.database.addModel(modelName, modelsLoader.models[modelName]));
            }

            // Broker
            if (this.broker) {
                await this.broker.start();
            }

            // Webserver
            if (this.web) {
                await this.web.start();
            }

            // Plugins
            await new Plugins(this.config.plugins || './dist/plugins').start();

            // Components
            await new ComponentsLoader({
                path: this.config.components.path || './dist/components',
                web: this.web || false,
                broker: this.broker || false,
                routine: this.routines || false,
            }).load();

            // Application is up and running
            this.healthServer.live();

            this.log.debug('Application is live');
        } catch (error) {
            this.log.error(error.message || error);
            // Application is up and running
            this.healthServer.down();
            // process.exit(1);
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
        if (this.routines) await this.routines.stop();
        if (this.broker) await this.broker.stop();
        if (this.healthServer) this.healthServer.down();
    }
};

export default new Muchas();