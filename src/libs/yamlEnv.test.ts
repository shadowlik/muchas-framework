/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const chaiAsPromised = require("chai-as-promised");
import chai from 'chai';

import yamlEnv from './yamlEnv';

chai.use(chaiAsPromised);

const expect: any = chai.expect;

describe('Errors', () => {
    it('Should throw an error', () => {
        expect(() => yamlEnv('')).to.throw();
    });
});