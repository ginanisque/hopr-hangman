import { expect } from 'chai';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import { makeMessage } from '../../helpers';
import Multiplayer from '../../../src/game/multiplayer.js';

describe("Multiplayer - Parse message", function() {
    it('If message is startGame but player is gameCreator, do not call setPlayers', function() {
        const ownAddress = process.env.REACT_APP_TEST_PEER_ID1;
        const gameCreator = ownAddress;

        const otherPlayers = [
            process.env.REACT_APP_TEST_PEER_ID2,
            process.env.REACT_APP_TEST_PEER_ID3,
            process.env.REACT_APP_TEST_PEER_ID4,
            process.env.REACT_APP_TEST_PEER_ID5,
        ]

        const players = [
            ...otherPlayers, gameCreator
        ]


        const multiplayer1 = new Multiplayer(players);
        sinon.stub(multiplayer1, 'getAddress').resolves(gameCreator);

        const roundData = {app: 'hangman', type: 'startGame', players};

        const wsMsg = JSON.stringify(roundData);

        const spy1 = sinon.stub(multiplayer1, 'setPlayers');

        return multiplayer1.parseMessage(wsMsg)
            .then(() => sinon.assert.notCalled(spy1))
    });

    it('If message is startGame, call savePlayerData', function() {
        const ownAddress = process.env.REACT_APP_TEST_PEER_ID1;
        const gameCreator = ownAddress;

        const otherPlayers = [
            process.env.REACT_APP_TEST_PEER_ID2,
            process.env.REACT_APP_TEST_PEER_ID3,
            process.env.REACT_APP_TEST_PEER_ID4,
            process.env.REACT_APP_TEST_PEER_ID5,
        ]

        const players = [
            ...otherPlayers, gameCreator
        ]

        const multiplayer1 = new Multiplayer(undefined, gameCreator);
        sinon.stub(multiplayer1, 'getAddress').resolves(otherPlayers[2]);

        const multiplayer2 = new Multiplayer([], gameCreator);
        sinon.stub(multiplayer2, 'getAddress').resolves(otherPlayers[1]);

        const multiplayer3 = new Multiplayer(null, gameCreator);
        sinon.stub(multiplayer3, 'getAddress').resolves(otherPlayers[3]);

        const roundData = {app: 'hangman', type: 'startGame', players};

        const wsMsg = JSON.stringify(roundData);

        const spy1 = sinon.stub(multiplayer1, 'setPlayers');
        const spy2 = sinon.stub(multiplayer2, 'setPlayers');
        const spy3 = sinon.stub(multiplayer3, 'setPlayers');

        // Start multiplayer games
        return multiplayer1.start()
            .then(multiplayer2.start())
            .then(multiplayer3.start())


        // Parse multiplayer messages
            .then(() => {
                // Reset spies in case there were any calls in .start()
                spy1.resetHistory();
                spy2.resetHistory();
                spy3.resetHistory();

                return multiplayer1.parseMessage(wsMsg)
                    .then(() => multiplayer2.parseMessage(wsMsg))
                    .then(() => multiplayer3.parseMessage(wsMsg))
            })
            .then(() => {
                sinon.assert.calledWith(spy1, players);
                sinon.assert.calledWith(spy2, players);
                sinon.assert.calledWith(spy3, players);
            });
    });

    it('If message is roundData, call saveRound', function() {
        const multiplayer = new Multiplayer([process.env.REACT_APP_TEST_PEER_ID3]);
        multiplayer.gameID = 'fjowiefja23';
        const player2 = process.env.REACT_APP_TEST_PEER_ID3;

        const roundData = {game_id: multiplayer.gameID,
            num:3, guess:"______",word:"fogles",
            roundScore:0, app:'hangman', gameScore: 7, type: 'roundData', peerId: player2};
        const wsMsg = JSON.stringify(roundData);

        const spy = sinon.stub(multiplayer, 'saveRound');

        return multiplayer.parseMessage(wsMsg)
            .then(() => {
                console.log("round data:", roundData);
                sinon.assert.called(spy);
                sinon.assert.calledWith(spy, sinon.match(roundData));
            });
    });

    it("If message has no property type: 'roundData'", function() {
        const multiplayer = new Multiplayer([process.env.REACT_APP_TEST_PEER_ID3]);

        const roundData = {guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7};
        const wsMsg = JSON.stringify(roundData);

        const spy = sinon.stub(multiplayer, 'receiveRoundScores').resolves(true);

        return multiplayer.parseMessage(wsMsg)
            .then(() => {
                sinon.assert.notCalled(spy);
            });
    });

    it("If message has property ('type', 'roundData'), call receiveRoundScores", function() {
        const game_id = 'faoiewf';

        const multiplayer = new Multiplayer([process.env.REACT_APP_TEST_PEER_ID3]);
        multiplayer.gameID = game_id;

        const roundData = {guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData', game_id};
        const wsMsg = JSON.stringify(roundData);

        const spy = sinon.stub(multiplayer, 'receiveRoundScores').resolves(true);

        return multiplayer.parseMessage(wsMsg)
            .then(() => {
                sinon.assert.calledWith(spy, roundData);
            });
    });

    it('If receiving gameOver message, set gameover for player that sent it', function() {
        const game_id = 'faoiewf';
        const hoprAddr = process.env.REACT_APP_TEST_PEER_ID4;

        const multiplayer = new Multiplayer([process.env.REACT_APP_TEST_PEER_ID3, hoprAddr]);
        multiplayer.gameID = game_id;

        const roundData = makeMessage({peerId:hoprAddr,type: 'gameOver',game_id}, multiplayer);

        const wsMsg = JSON.stringify(roundData);

        const spy = sinon.stub(multiplayer, 'receiveRoundScores').resolves(true);

        return multiplayer.parseMessage(wsMsg)
            .then(() => {
                expect(multiplayer.playerData[hoprAddr]).to.have.property('gameOver', true);
            });
    });
});
