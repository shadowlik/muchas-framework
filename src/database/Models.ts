import fs from 'fs';
import path from 'path';
import MuchasEvents from '../Events';

export = class ModelsLoader {
    path: string;
    modelsFiles: string[] = [];
    models: { [x: string]: any } = {};

    /**
     * Creates an instance of ModelsLoader.
     * @param {string} basePath
     */
    constructor(basePath: string) {
        this.path = path.join(process.cwd(), basePath);

        if (fs.existsSync(this.path)) {
            this.modelsFiles = fs.readdirSync(this.path);
        } else {
            console.debug(`Model path not found at ${this.path}`);
        }
    }

    /**
     * Load models
     *
     * @returns {Promise<void>}
     */
    async load(): Promise<ModelsLoader> {
        MuchasEvents.debug('Loading models');

        for(let i = 0; i < this.modelsFiles.length; i += 1) {
            let modelFile = this.modelsFiles[i];
            if (
                // /.ts$/ig.test(modelFile) && (modelFile.indexOf('.ts') == modelFile.length - 3) ||
                /.js$/ig.test(modelFile) && (modelFile.indexOf('.js') == modelFile.length - 3)
            ) {
                let modelName = modelFile.replace(/.ts|.js/ig, '');

                let model = await import(path.join(this.path, modelFile));
                MuchasEvents.debug(`Model ${modelName} loaded`);

                this.models[modelName] = model.default;

                continue;
            }
        }

        MuchasEvents.debug('Models loaded');

        return this;
    }
};
