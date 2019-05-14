import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import Web from '../web';

export interface Controller {
    (req: Request, res: Response, next: NextFunction): void;
}

export interface Route {
    path: string;
    method: string;
    controller: Controller;
    secure?: boolean;
}

interface ComponentOptions {
    routes?: Route[];
}


export class Component implements ComponentOptions {
    routes?: Route[];
    alias?: string;
    constructor(options: ComponentOptions) {
        if (options.routes) this.routes = options.routes;
    }
}

interface ComponentsLoaderOptions {
    path: string;
    web: Web | false;
}

export default class ComponentsLoader {
    path: string;
    componentsFiles: string[];
    components: Component[] = [];
    web: Web;

    constructor(options: ComponentsLoaderOptions) {
        if (options.web) this.web = options.web;
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

    async load(): Promise<void> {
        await this.loadComponents();
        if (this.web) this.loadRoutes();
    };

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
        }
    };

    private loadRoutes(): Promise<void> {
        this.components.forEach((component: Component): void  => {
            component.routes.forEach((route: Route): void => {
                this.web.addRoute(route.method, path.join('/', component.alias, route.path), route.controller, route.secure);
            });
        });
        return;
    }
}