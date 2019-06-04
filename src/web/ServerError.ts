import uniqid from 'uniqid';

export class ServerError extends Error {
    uid: string;
    code: number | string;
    status: number;
    meta: any;

    constructor(m: string, code: number | string, status: number, uid?: string, meta?: any) {
        super(m);

        this.code = code;
        this.status = status;
        this.uid = uid || uniqid();
        this.meta = meta;
    }
}