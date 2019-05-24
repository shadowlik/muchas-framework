/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const chaiAsPromised = require("chai-as-promised");
import chai from 'chai';
import { mockReq, mockRes } from 'sinon-express-mock'
import sinonChai from 'sinon-chai'

import Web from '../../web/Server';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect: any = chai.expect;
const assert: any = chai.assert;

class WebTest extends Web {

    constructor(options: any) {
        super(options);
    }

    publicSecure(secure: boolean) {
        return this.secureRouteMiddleware();
    }
}

describe('Web Feature', () => {
    it('Should create a new instance without errors', function() {
        const web = new Web({});
        expect(web).to.have.property('start');
    });

    it('Should create a new instance with errors', function() {
        const web = new Web({});
        expect(web).to.not.have.property('sada');
    });

    it('Should create a new instance with errors', function() {
        const web = new Web({});
        expect(web.app).to.have.property('listen');
    });

    it('Default port', function() {
        const web = new Web({});
        assert.equal(web.port, 8000, 'Default port');
    });

    it('Should be a custom express instance', function() {
        const web = new Web({});
        expect(() => web.addRoute('get', '/', () => {}), true).to.not.throw();
    });

    it('Should be a custom express instance', function() {
        const web = new WebTest({});
        expect(web.publicSecure(true)).to.throw();
    });

    it('Should be a custom express instance', function() {
        const web = new WebTest({});
        const req = mockReq();
        req.headers = { authorization : '' };
        const res = mockRes();
        web.publicSecure(true)(req, res);

        expect(res.json).to.be.calledWith({ error: { code: 403, message: "Not authorized" } } );
    });

    it('Test server', async() => {
        const web = new WebTest({
            port: 9032,
        });
        await web.start();
        expect(web.server).to.have.property('listen');
    });
});