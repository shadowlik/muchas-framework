import Route from '../web/Route';
import { RPC, Task } from '../broker/Broker';
import Routine from '../routine/Routine';

interface ComponentOptions {
    routes?: Route[];
    rpc?: RPC[];
    tasks?: Task[];
    routines?: Routine[];
}

export default class Component implements ComponentOptions {
    routes?: Route[];
    rpc?: RPC[];
    tasks: Task[];
    routines?: Routine[];
    alias?: string;

    constructor(options: ComponentOptions) {
        if (options.routes) this.routes = options.routes;
        if (options.rpc) this.rpc = options.rpc;
        if (options.tasks) this.tasks = options.tasks;
        if (options.routines) this.routines = options.routines;
    }
}
