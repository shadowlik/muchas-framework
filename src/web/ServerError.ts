export class ServerError extends Error {
    uid: string;
    code: number;

    constructor(m: string) {
        super(m);
    }
}