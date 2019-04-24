/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const chaiAsPromised = require("chai-as-promised");
import chai from 'chai';

import Muchas from '../../src/index';

chai.use(chaiAsPromised);

const expect: any = chai.expect;

describe('Muchas init', () => {
    it('Test Config', function () {
        expect(Muchas).to.have.property('config');
    });
});