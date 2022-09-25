import { getAddress, sendHoprMessage } from '../../src/connectivity/hoprNode.js';
import { expect } from 'chai';
import config from '../../src/config/config.js';

describe('Hopr node: REST', function() {
    it('Get address', function() {
        config.restURL = 'http://localhost:13301';
        config.authToken = '^^LOCAL-testing-123^^';

        return getAddress()
            .then(res => {
                expect(res).to.match(/^16Uiu2HAm/);
            });
    });

    it('Send message', function() {
        config.restURL = 'http://localhost:13301';
        config.authToken = '^^LOCAL-testing-123^^';

        const addr = '16Uiu2HAmT86EaxBRCKbW9hmWVDQUJWo6aUrtHwKS8xP6mTmsKirs';
        return sendHoprMessage(addr, 'hello there')
            .then(res => {
                console.log('sent message\n', res);
            });
    });
});
