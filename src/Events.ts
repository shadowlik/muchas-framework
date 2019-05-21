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
}

const e = new MuchasEvents();

export = e;
