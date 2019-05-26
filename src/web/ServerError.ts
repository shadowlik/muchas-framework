import uid from 'uniqid';

export class ServerError extends Error {
    uid: string;
    code: number | string;
    status: number;

    constructor(m: string, code: number | string, status: number) {
        super(m);

        this.code = code;
        this.status = status;
        this.uid = uid();
    }
}