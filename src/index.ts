import "source-map-support/register"; // Stack trace with source map
import yamlEnv from './libs/YamlEnv';
import Logger, { LogOptions } from './log';
import apm from './Apm';
import { Agent } from "./Apm.interface";

const config = yamlEnv(process.env.MUCHASYML || undefined);

const Apm: Agent = apm(config.name, config.env, config.apm);

// Apm
export { Apm };

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
import Web, { RequestPrivate } from './web/Server';
import Route from './web/Route';
export { Route };
export { Request, Response, NextFunction } from 'express';
export { ServerError } from './web/ServerError';

// Health
import MuchasEvents from './Events';
import Plugins from './Plugins';

// Redis
import Redis from './Redis';

// Elasticsearch
import { Client as ElasticClient } from "@elastic/elasticsearch";

// Swagger
import Swagger from "./swagger";

/**
 * Main File
 */
class Muchas {
    log: Logger | Console;
    database: Database;
    web: Web;
    RoutineLoader: RoutineLoader;
    broker: Broker;
    // eslint-disable-next-line
    config: { [x: string]: any };
    apm: any;
    plugins: any;
    redis: Redis;
    elastic: ElasticClient;
    swagger: Swagger;
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

        // Redis
        if (this.config.redis) {
            this.redis = new Redis(this.config.redis.uri);
        }

        // Logger
        this.log = console;
        if (this.config.logger) {
            let loggerConfig: LogOptions = {};

            if (this.config.logger.elasticsearch) {
                loggerConfig.elastic = {
                    host: this.config.logger.elasticsearch.host,
                    level: this.config.logger.elasticsearch.level || "info",
                    indexPrefix: this.config.logger.elasticsearch.indexPrefix
                };
                // Also lets create a elastic instance for any other index needs
                this.elastic = new ElasticClient({
                    node: this.config.logger.elasticsearch.host
                });
            }

            this.log = new Logger(loggerConfig);
        }

        // Database
        if (this.config.database) {
            this.database = new Database({
                uri: this.config.database.uri,
                poolSize: this.config.database.poolSize
            });
        }

        // Broker
        if (this.config.broker) {
            this.broker = new Broker(
                {
                    host: this.config.broker.host
                },
                this.apm
            );
        }

        // Web
        if (this.config.web) {
            this.web = new Web({
                port: this.config.web.port,
                headers: this.config.web.headers,
                secret: this.config.web.secret
            });
        }

        // Routines
        if (this.config.database && this.config.routines) {
            this.RoutineLoader = new RoutineLoader(
                {
                    mongoConString: this.config.database.uri || null,
                    web: this.web
                },
                this.apm
            );
        }

        // Console via event
        MuchasEvents.events.on("debug", (message: string): void => {
            this.log.debug(message);
        });

        // Bind the graceful shutdown
        process.on("SIGTERM", this.shutdown);
        process.on("SIGINT", this.shutdown);
    }

    /**
   * Starts the framework
   *
   * @returns {Promise<void>}
   * @memberof Muchas
   */
    async init(): Promise<void> {
        try {
            this.log.debug("Starting application");

            // Database
            if (this.database) {
                await this.database.connect();

                // Load models
                const modelsLoader = await new ModelsLoader(
                    this.config.database.model.path || "dist/models"
                ).load();

                // Add the model to the mongoose instance
                Object.keys(modelsLoader.models).forEach((modelName): void =>
                    this.database.addModel(modelName, modelsLoader.models[modelName])
                );
            }

            // Broker
            if (this.broker) await this.broker.start();

            // Webserver
            if (this.web) await this.web.start();

            // Swagger/OpenAPI
            if (this.web && process.env.NODE_ENV !== "production") {
                this.swagger = new Swagger(this.web.app);
            }

            // Plugins
            this.plugins = await new Plugins(
                this.config.plugins || "./dist/plugins"
            ).start();

            // Components
            await new ComponentsLoader({
                path: this.config.components.path || "./dist/components",
                web: this.web || false,
                broker: this.broker || false,
                routine: this.RoutineLoader || false
            }).load();

            // Application is up and running
            this.web.live();

            // Useful console information
            let usefulLog = "Application is live";
            if (this.web) {
                usefulLog = `${usefulLog} \nLIVENESS: http://localhost:${this.config.web.port}/healthz`;
                usefulLog = `${usefulLog} \n    REST: http://localhost:${this.config.web.port}`;
                if(this.swagger.status) {
                    usefulLog = `${usefulLog} \nOPEN API: http://localhost:${this.config.web.port}/openapi`;
                }
            }
            if (this.RoutineLoader) {
                usefulLog = `${usefulLog} \nROUTINES: http://localhost:${this.config.web.port}/routines`;
            }

            this.log.debug(usefulLog);
        } catch (error) {
            this.log.error(error);
            // Application is up and running
            this.web.down();
            if (this.config.env === "production") {
                process.exit(1);
            }
        }
    }

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
        if (this.web) this.web.down();
        process.exit(0);
    }
};

const muchas = new Muchas();

export default muchas;

export { RequestPrivate };
export const log = muchas.log;
export const database = muchas.database;
export const broker = muchas.broker;
export const plugins = muchas.plugins;
export const elastic = muchas.elastic;