import { Job } from 'agenda';

export default interface Routine {
    id: string;
    cron: string;
    action: RoutineAction;
    startup?: boolean;
    concurrency?: number;
    lockLifetime?: number;
    priority?: string;
}

interface RoutineAction {
    (job: Job, done: Function): void;
}
