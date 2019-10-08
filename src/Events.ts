import events from 'events';

class MuchasEvents {
    events: events;
    on: Function;

    constructor() {
        this.events = new events();
        this.on = this.events.on;
    }

    debug(payload: any): void {
        this.events.emit('debug', payload);
    };

    error(payload: any): void {
        this.events.emit('error', payload);
    };
}

const e = new MuchasEvents();

export = e;
