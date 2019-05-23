/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const chaiAsPromised = require("chai-as-promised");
import chai from 'chai';

import Database from '../../database/Database';

chai.use(chaiAsPromised);

class DatabaseTest extends Database {
    connectString: string;
    constructor(options: any) {
        super(options);
        this.connectString = this.connectionUrl;
    }
}

const expect: any = chai.expect;
const assert: any = chai.assert;

describe('Testing database', () => {
    it('Should throw an error', async () => {
        const db = new DatabaseTest({
            uri: 'teste'
        });

        assert.isRejected(db.connect(), Error)
    });

    it('Should throw an error', async () => {
        const db = new DatabaseTest({
            uri: 'teste'
        });

    });
});