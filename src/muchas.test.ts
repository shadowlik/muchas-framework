/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const chaiAsPromised = require("chai-as-promised");
import chai from 'chai';

import Muchas from './index';

chai.use(chaiAsPromised);

const expect: any = chai.expect;

before(async function() {
    await Muchas.init();
});

describe('Muchas init', () => {
    it('Test logger', function () {

    });
});