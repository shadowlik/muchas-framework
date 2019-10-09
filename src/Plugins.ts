/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import fs from 'fs';
import path from 'path';
import MuchasEvents from './Events';

/**
 * Plugins Class
 *
 * @export
 * @class Plugins
 */
export default class Plugins {
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
            MuchasEvents.debug(`Plugins folder not found in path ${this.pluginsFolderPath}`);
            return;
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
        if (this.pluginsPaths.length === 0) return;

        MuchasEvents.debug('Loading plugins');

        for (let i = 0; this.pluginsPaths.length > i; i += 1) {
            const plugin = this.pluginsPaths[i];
            const pluginName = plugin.replace('.js', '');
            const pluginModulePath = path.join(this.pluginsFolderPath, plugin);
            const pluginModule = await import(pluginModulePath);

            if (!pluginModule.default) {
                throw Error(`${pluginModulePath} must be exported as default`);
            }

            const isPromise = pluginModule.default instanceof Promise;

            if(isPromise) {
                this.plugins[pluginName] = await pluginModule.default;
            } else {
                this.plugins[pluginName] = pluginModule.default;
            }

            MuchasEvents.debug(`Plugin ${pluginName}`);
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
