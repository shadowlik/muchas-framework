
import fs from 'fs';
import path from 'path';
import Web, { Route } from '../web/Server';
import Broker, { RPC, Task } from '../broker/Broker';
import Routines, { RoutineLoader } from '../routine/RoutineLoader';
import Component from './Component';

interface ComponentsLoaderOptions {
    path: string;
    web: Web | false;
    broker: Broker | false;
    routine: RoutineLoader | false;
}

export default class ComponentsLoader {
    path: string;
    componentsFiles: string[];
    components: Component[] = [];
    web: Web;
    broker: Broker;
    routine: RoutineLoader;

    /**
     * Creates an instance of ComponentsLoader.
     * @param {ComponentsLoaderOptions} options
     * @memberof ComponentsLoader
     */
    constructor(options: ComponentsLoaderOptions) {
        if (options.web) this.web = options.web;
        if (options.broker) this.broker = options.broker;
        if (options.routine) this.routine = options.routine;
        if (options.path) this.path = options.path;

        // The component folder exists?
        if (!fs.existsSync(this.path)) {
            throw Error(`Components folder: ${this.path} not found`);
        }

        // Read the component folder
        this.componentsFiles = fs.readdirSync(this.path);

        // Check if not empty
        if (this.componentsFiles.length === 0) {
            throw Error(`No components found at ${this.path}`);
        }
    };

    /**
     * Start the component loading process
     *
     * @returns {Promise<void>}
     * @memberof ComponentsLoader
     */
    async load(): Promise<void> {
        await this.loadComponents();
    };

    /**
     * Load the components
     *
     * @returns {Promise<void>}
     * @memberof ComponentsLoader
     */
    async loadComponents(): Promise<void> {
        for(let i = 0; this.componentsFiles.length > i; i += 1) {
            let component = this.componentsFiles[i];
            const componentPath = path.join(process.cwd(), this.path, component);
            const componentLoad = await import(componentPath);
            const componentModule: Component = componentLoad.default;

            // Check if what we're importing is a Component instance
            if (!(componentModule instanceof Component)) {
                throw Error(`${component} is not a instance of Component`);
            }

            componentModule.alias = component;
            this.components.push(componentModule);

            // Load routes
            if (this.web && componentModule.routes) {
                componentModule.routes.forEach((route: Route): void => {
                    let routePath = path.join('/', componentModule.alias, route.path)

                    // If is a root component
                    if (componentModule.alias === 'root') {
                        routePath = path.join('/', route.path)
                    }

                    this.web.addRoute(route.method, path.join('/', routePath), route.controller, route.secure);
                });
            }

            // Load broker and RPC
            if (this.broker) {
                if (componentModule.tasks) {
                    componentModule.tasks.forEach((task: Task): void => {
                        this.broker.bindTask(task);
                    });
                }

                if (componentModule.rpc) {
                    componentModule.rpc.forEach((rpc: RPC): void => {
                        this.broker.bindRPC(rpc);
                    });
                }
            }

            // Load routines
            if (this.routine && componentModule.routines) {
                componentModule.routines.forEach((routine: Routines): void => {
                    this.routine.addJob(routine);
                })
            }
        }
    };
}