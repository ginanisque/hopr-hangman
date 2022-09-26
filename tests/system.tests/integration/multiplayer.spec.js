import { expect } from 'chai';
import sinon from 'sinon';
import Multiplayer from '../../../src/game/multiplayer.js';
import { getChannels } from '../../../src/connectivity/hoprNode.js';
import config from '../../../src/config/config.js';

describe.skip("Multiplayer", function() {
    before(() => {
        config.restURL = process.env.REACT_APP_TEST_NODE_HTTP_URL1;
        config.authToken = process.env.REACT_APP_TEST_SECURITY_TOKEN;
    });

    beforeEach((done) => {
        setTimeout(() => done(), 300);
    });

    it('If otherPlayers == null, do not carry out any actions');

    it('If otherPlayers == [], do not carry out any actions');

    it('Start(): Open message socket');

    it('CreateGame: should open channels to all other players', function() {
        this.timeout(5000);
        const p2 = process.env.REACT_APP_TEST_PEER_ID2,
            p3 = process.env.REACT_APP_TEST_PEER_ID3,
            p4 = process.env.REACT_APP_TEST_PEER_ID4,
            p5 = process.env.REACT_APP_TEST_PEER_ID5;

        const otherPlayers = [
            p2, p3, p4, p5
        ];

        const multiplayer = new Multiplayer(otherPlayers);

        return multiplayer.createGame()
            .then(res => {
                expect(res).to.be.ok;
                return getChannels()
            }).then(res => {
                console.log("res:", res);
                console.log("res:", res.incoming);
                expect(res.incoming.map(ch => ch.peerId)).to.include.members(otherPlayers);
            });
    });

    it('ConnectGame: Open channel to game creator', function() {
        const creator = process.env.REACT_APP_TEST_PEER_ID4;
        console.log("creator:", creator);
        const multiplayer = new Multiplayer(creator);

        return expect(multiplayer.connectGame(creator)).to.be.fulfilled
            .then(() => {
                return getChannels()
            }).then(res => {
                console.log("res:", res);
                console.log("res:", res.incoming);
                console.log('creaotr:', creator);
                expect(res.incoming.map(ch => ch.peerId)).to.include.members([creator]);
            });
    });

    describe("Parse message:", function() {
        describe("If message is a json obj", function() {
            it('If message is roundData, save to playerData', function() {

                console.log("testing...");
                const multiplayer = new Multiplayer([process.env.REACT_APP_TEST_PEER_ID3]);
                const player2 = '16ajoi'+ faker.random.alphaNumeric(16);

                const roundData = {num:3, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData', peerId: player2};
                const wsMsg = JSON.stringify(roundData);

                return multiplayer.parseMessage(wsMsg)
                    .then(() => {
                        expect(multiplayer.getRounds(player2)).to.have.property("3");
                    });
            });
        });
    });
});
