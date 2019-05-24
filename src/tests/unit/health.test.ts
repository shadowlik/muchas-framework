import Health from '../../Health';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const chaiAsPromised = require("chai-as-promised");
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
chai.use(chaiAsPromised);
chai.should();

const expect: any = chai.expect;

describe('Health Class', () => {
    const health = new Health();

    it('Test Constructor', function () {
        expect(health).to.have.property('app');
    });

    it('Test Health app Function', function () {
        expect(health.app).to.have.property('use');
    });

    it('Test Start Function', function () {
        expect(() => health.start()).to.not.throw();
    });

    it('Test Live Function', function () {
        expect(() => health.live()).to.not.throw();
    });

    it('Test Live Response', function (done) {
        chai.request(health.app)
            .get('/')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('Test Down Function', function () {
        expect(() => health.down()).to.not.throw();
    });

    it('Test Stop Function', function () {
        expect(() => health.stop()).to.not.throw();
    });
});
