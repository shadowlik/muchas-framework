import express, { Response, Request, NextFunction } from "express";

import swaggerUi from "swagger-ui-express";
import jsyaml from "js-yaml";
import fs from "fs";
import path from "path";

export default class Swagger {
    app: express.Express;
    status: boolean = false;
    constructor(app: express.Express) {
        this.app = app;
        try {
            const OpenAPI = jsyaml.load(
                fs.readFileSync(path.join(process.cwd(), "OpenAPI.yml"), "utf-8")
            );
            this.app.use("/openapi", swaggerUi.serve, swaggerUi.setup(OpenAPI));
            this.status = true;
        } catch (error) {
            if (error.code && error.code === "ENOENT") return;
            console.log(error);
        }
    }
}
