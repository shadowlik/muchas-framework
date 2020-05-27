import agenda from 'agenda';
import os from 'os';
import Routine from './Routine';
import web from '../web/Server';
const apmtrace = require("@google-cloud/trace-agent").get();

/* eslint-disable-next-line */
const Agendash = require('agendash');

interface RoutinesOptions {
    mongoConString: string;
    web: web;
}

export default class RoutineLoader {
    Agenda: agenda;
    Web: web;
    apm: any;
    /**
     * Creates an instance of Routines.
     * @param {RoutinesOptions} options
     * @memberof Routines
     */
    constructor(options: RoutinesOptions, Apm?: any) {
        let opt = {};
        this.Web = options.web;
        this.apm = Apm;
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
            timezone,
        } = routine;

        try {
            let opt: any = {};

            opt.concurrency = concurrency || 1;
            if(lockLifetime) opt.lockLifetime = lockLifetime;
            if(timezone) opt.timezone = timezone;

            this.Agenda.define(id, opt, async function (job, done): Promise<void> {
                let trans: any;
                if(this.apm) trans = this.apm.startTransaction(id, 'routines');
                apmtrace.runInRootSpan(
                    { name: `routines.${id}` },
                    async (rootSpan: any): Promise<void> => {
                        await action(job, (): void => {
                            done();
                            if (this.apm && trans) trans.end();
                            rootSpan.endSpan();
                        });
                    }
                );
            });

            this.Agenda.every(cron, id, opt, opt);
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