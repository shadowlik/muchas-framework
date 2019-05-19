/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import fs from 'fs';
import path from 'path';

/**
 * Plugins Class
 *
 * @export
 * @class Plugins
 */
export class Plugins {
    pluginsFolderPath: string;
    pluginsPaths: string[] = [];
    plugins: { [x: string]: any } = {};

    /**
     *Creates an instance of Plugins.
    * @param {string} pluginPath
    * @memberof Plugins
    */
    constructor(pluginsFolderPath: string) {
        this.pluginsFolderPath = path.join(process.cwd(), pluginsFolderPath);
    }

    /**
     * Get Plugins
     *
     * @private
     * @returns {string[]}
     * @memberof Plugins
     */
    private getPlugins(): void {
        if (!fs.existsSync(this.pluginsFolderPath)) {
            throw Error(`Plugins folder not found in path ${this.pluginsFolderPath}`);
        }

        this.pluginsPaths =
            fs.readdirSync(this.pluginsFolderPath).filter(plugin => plugin.match(/js$/));
    }

    /**
     * Load the plugin module
     *
     * Load and check if the plugin module is a promise
     *
     * @param {string} plugin
     * @returns
     * @memberof Plugins
     */
    async loadPlugins(): Promise<void> {
        for (let i = 0; this.pluginsPaths.length > i; i += 1) {
            const plugin = this.pluginsPaths[i];
            const pluginName = plugin.replace('.js', '');
            const pluginModulePath = path.join(this.pluginsFolderPath, plugin);
            const pluginModule = await import(pluginModulePath);

            if (!pluginModule.default) {
                throw Error(`${pluginModulePath} must be exported as default`);
            }

            if (pluginModule.default instanceof Promise === false) {
                throw Error(`${pluginModulePath} must be a promise`);
            }

            this.plugins[pluginName] = await pluginModule.default;
        }
    }

    /**
     *
     *
     * @returns
     * @memberof Plugins
     */
    async start(): Promise<any> {
        this.getPlugins();

        await this.loadPlugins();

        return this.plugins;
    }
}
