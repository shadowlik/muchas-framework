import agenda from 'agenda';
import os from 'os';

export interface Routine {
    cron: string;
    startup: boolean;
    concurrency: number;
    priority: string;
    action: RoutineAction;
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

        this.Agenda.name(`${os.hostname}-${process.pid}`);
    }
}