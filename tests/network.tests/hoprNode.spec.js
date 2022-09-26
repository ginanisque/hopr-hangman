import { getAddress, sendHoprMessage, getChannels, establishChannel } from '../../src/connectivity/hoprNode.js';
import { expect } from 'chai';
import config from '../../src/config/config.js';

describe('Hopr node: REST', function() {
    it('Establish channel to peer', function() {
        config.restURL = 'http://localhost:13301';
        config.authToken = '^^LOCAL-testing-123^^';

        return establishChannel('16Uiu2HAmGZ8zeV2kcMTPx55NRXiJSmpX4kcuiTE21YifiSzrwGL3')
            .then(res => {
                console.log("res:", res);
                expect(res).to.be.ok;
                return getChannels('16Uiu2HAmGZ8zeV2kcMTPx55NRXiJSmpX4kcuiTE21YifiSzrwGL3')
            })
            .then(res => {
                expect(res).to.be.an('array');
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
