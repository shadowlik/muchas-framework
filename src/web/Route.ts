import express, { Response, Request, NextFunction } from 'express';

export interface Controller {
    (req: Request, res: Response, next: NextFunction): void;
}

export default interface Route {
    path: string;
    method: string;
    controller: Controller;
    secure?: boolean;
}
