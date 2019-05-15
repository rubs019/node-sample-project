const app = require('../dist/app/app')
const chai  = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect

chai.use(chaiHttp)

describe('Chai test', () => {
    it('Should work', () => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                expect(err).to.be.null
                expect(res).to.have.status(200)
                expect(res).to.be.json
                expect(res.body.message).to.equal('Success')
            })
    })
})
