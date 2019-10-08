import Route from '../web/Route';
import { RPC, Message } from '../broker/Broker';
import Routine from '../routine/Routine';

interface ComponentOptions {
    routes?: Route[];
    rpc?: RPC[];
    messages?: Message[];
    routines?: Routine[];
}

export default class Component implements ComponentOptions {
    routes?: Route[];
    rpc?: RPC[];
    messages: Message[];
    routines?: Routine[];
    alias?: string;

    constructor(options: ComponentOptions) {
        if (options.routes) this.routes = options.routes;
        if (options.rpc) this.rpc = options.rpc;
        if (options.messages) this.messages = options.messages;
        if (options.routines) this.routines = options.routines;
    }
}
