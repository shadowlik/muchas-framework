import agenda from 'agenda';
import os from 'os';
import Routine from './Routine';
import web from '../web/Server';
const Agendash = require('agendash');

interface RoutinesOptions {
    mongoConString: string;
    web: web;
}

export default class RoutineLoader {
    Agenda: agenda;
    Web: web;
    /**
     * Creates an instance of Routines.
     * @param {RoutinesOptions} options
     * @memberof Routines
     */
    constructor(options: RoutinesOptions) {
        let opt = {};
        this.Web = options.web;
        if (options.mongoConString) {
            opt = {
                db: {
                    address: options.mongoConString || null,
                    collection: 'agenda',
                    options: {
                        useNewUrlParser: true,
                    }
                }
            }
        }
        this.Agenda = new agenda(opt);
        this.Agenda.name(`${os.hostname}-${process.pid}`);
        this.Agenda.start();

        this.Web.app.use('/routines', Agendash(this.Agenda));
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
            concurrency,
            lockLifetime,
        } = routine;

        try {
            let opt: any = {};

            if(concurrency) opt.concurrency = concurrency;
            if(lockLifetime) opt.lockLifetime = lockLifetime;

            this.Agenda.define(id, opt, (job, done): void => {
                action(job, done);
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