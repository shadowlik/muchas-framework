import Plugins from '../../Plugins';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const chaiAsPromised = require("chai-as-promised");
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
chai.use(chaiAsPromised);
chai.should();

const expect: any = chai.expect;

describe('Plugin Class', () => {
    const plugins = new Plugins('src/tests/integration/plugins');

    it('Test Start Function', function () {
        expect(() => plugins.start()).to.not.throw();
    });

    it('Test Start Function', function () {
        expect(() => plugins.loadPlugins()).to.not.throw();
    });

});
