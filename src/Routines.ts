import agenda from 'agenda';
import os from 'os';

export interface Routine {
    id: string;
    cron: string;
    action: RoutineAction;
    startup?: boolean;
    concurrency?: number;
    lockLimit?: number;
    priority?: string;
}

export interface RoutineAction {
    (done: Function): void;
}

interface RoutinesOptions {
    mongoConString: string;
}

export default class Routines {
    Agenda: agenda;

    /**
     * Creates an instance of Routines.
     * @param {RoutinesOptions} options
     * @memberof Routines
     */
    constructor(options: RoutinesOptions) {
        let opt = {};
        if (options.mongoConString) {
            opt = {
                db: {
                    address: options.mongoConString || null,
                    collection: 'agenda',
                }
            }
        }
        this.Agenda = new agenda(opt);
        this.Agenda.name(`${os.hostname}-${process.pid}`);
        this.Agenda.start();
    }


    /**
     * Add job
     *
     * @param {Routine} routine
     * @returns {Promise<void>}
     * @memberof Routines
     */
    async addJob(routine: Routine): Promise<void> {
        const {
            id,
            cron,
            action,
            concurrency =20,
            lockLimit = 20,
        } = routine;

        try {
            this.Agenda.define(id, {
                concurrency,
                lockLimit,
            }, (job, done): void => {
                action(done);
            });

            this.Agenda.every(cron, id);
        } catch(e) {
            throw new Error(e);
        }
    }

    /**
     * Stop the agenda routine
     *
     * @returns {Promise<void>}
     * @memberof Routines
     */
    async stop(): Promise<void> {
        await this.Agenda.stop();
    }
}