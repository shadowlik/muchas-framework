/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const chaiAsPromised = require("chai-as-promised");
import chai from 'chai';

import yamlEnv from './yamlEnv';

chai.use(chaiAsPromised);

const expect: Chai.ExpectStatic = chai.expect;

describe('Yaml Env', () => {
    it('Should throw an error', () => {
        expect(() => yamlEnv('')).to.throw();
    });

    it('Should return an object', () => {
        expect(yamlEnv()).to.be.an('object');;
    });
});