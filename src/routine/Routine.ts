export default interface Routine {
    id: string;
    cron: string;
    action: RoutineAction;
    startup?: boolean;
    concurrency?: number;
    lockLimit?: number;
    priority?: string;
}

interface RoutineAction {
    (done: Function): void;
}
