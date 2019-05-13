import fs from 'fs';
import path from 'path';
import mongoose, { Model, Schema } from 'mongoose';

export = class ModelsLoader {
    path: string;
    modelsFiles: string[] = [];
    models: { [x: string]: any } = {};

    constructor(basePath: string) {
        this.path = path.join(process.cwd(), basePath);

        this.modelsFiles = fs.readdirSync(this.path);
    }

    /**
     * Load models
     *
     * @returns {Promise<void>}
     */
    async load(): Promise<ModelsLoader> {
        for(let i = 0; i < this.modelsFiles.length; i += 1) {
            let modelFile = this.modelsFiles[i];
            if (
                /.ts$/ig.test(modelFile) && (modelFile.indexOf('.ts') == modelFile.length - 3) ||
                /.js$/ig.test(modelFile) && (modelFile.indexOf('.js') == modelFile.length - 3)
            ) {
                let modelName = modelFile.replace(/.ts|.js/ig, '');
                let model = await import(path.join(this.path, modelFile));

                this.models[modelName] = model.default;

                continue;
            }
        }
        return this;
    }


};
