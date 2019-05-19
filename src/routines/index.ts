import agenda from 'agenda';

export interface Routine {
    cron: string;
    startup: boolean;
    action: Function;
}

export interface RoutineAction {
    (job: any, done: Function): void;
}

interface RoutinesOptions {
    mongoConString: string;
}


export default class Routines {
    Agenda: agenda;

    constructor(options: RoutinesOptions) {
        this.Agenda = new agenda({
            db: {
                address: options.mongoConString || null,
                collection: 'agenda',
            }
        });
    }
}