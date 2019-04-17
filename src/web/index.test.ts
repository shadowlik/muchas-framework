/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const chaiAsPromised = require("chai-as-promised");
import chai from 'chai';

import Web from './index';

chai.use(chaiAsPromised);

const expect: any = chai.expect;

describe('Web Feature', () => {
    it('Should create a new instance without errors', function() {
        const web = new Web({});
        expect(web).to.have.property('start');
    });

    it('Should create a new instance with errors', function() {
        const web = new Web({});
        expect(web).to.not.have.property('sada');
    });
});