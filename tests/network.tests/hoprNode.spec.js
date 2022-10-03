import { getAddress, sendHoprMessage, getChannels, establishChannel } from '../../src/connectivity/hoprNode.js';
import { expect } from 'chai';
import config from '../../src/config/config.js';

describe('Hopr node: REST', function() {
    it('Establish channel to peer', function() {
        config.restURL = 'http://localhost:13301';
        config.authToken = '^^LOCAL-testing-123^^';
        const peerId2 = '16Uiu2HAmGZ8zeV2kcMTPx55NRXiJSmpX4kcuiTE21YifiSzrwGL3';

        return establishChannel(peerId2)
            .then(res => {
                console.log("res:", res);
                expect(res).to.be.ok;
                return getChannels('16Uiu2HAmGZ8zeV2kcMTPx55NRXiJSmpX4kcuiTE21YifiSzrwGL3')
            })
            .then(res => {
                expect(res).to.have.keys('incoming', 'outgoing');
                console.log('res:', res);
                expect(res.incoming).to.be.an('array');
                expect(res.outgoing).to.be.an('array');

                expect(res.incoming.map(c => c.peerId)).to.include.members([peerId2]);
            });
    });

    it('Send message', function() {
        config.restURL = 'http://localhost:13301';
        config.authToken = '^^LOCAL-testing-123^^';

        const addr = '16Uiu2HAmGZ8zeV2kcMTPx55NRXiJSmpX4kcuiTE21YifiSzrwGL3';
        return establishChannel(addr)
            .then(() => sendHoprMessage(addr, 'hello there'))
            .then(res => {
                console.log('sent message\n', res);
            });
    });
});
