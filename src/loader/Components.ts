import { Request, Response, NextFunction } from 'express';

export interface Controller {
    (req: Request, res: Response, next: NextFunction): void;
}

export interface Route {
    path: string;
    method: string;
    secure: boolean;
    controller: Controller;
}

export interface Component {
    routes: Route[];
}

export default class ComponentLoader {
    constructor() {

    }
}