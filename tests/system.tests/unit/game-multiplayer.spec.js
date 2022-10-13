import { faker } from '@faker-js/faker';
import { expect } from 'chai';
import Game from '../../../src/game/game';
import Multiplayer from '../../../src/game/multiplayer';
import config from '../../../src/config/config.js';
import sowpodslist from '../../../src/wordlists/sowpods.js';

import { fakeHoprAddress } from '../../helpers.js';
import { mockFetch } from '../../mocks.js';

import sinon from 'sinon';

describe('Multiplayer Game (unit tests):', function() {
    before(() => {
        config.restURL = 'http://localhost:3001';
        config.authCode = 'ofjieaw';
        mockFetch();
    });

    describe('Game config', function() {
        it('multiplayer=true, connectgame=true, gameCreator is set, set multiplayer', function() {
            const gameCreator = fakeHoprAddress();

            const configObj = {
                multiplayer: true,
                connectGame: true,
                otherPlayers: [gameCreator, fakeHoprAddress()],
                gameCreator
            };

            let game = new Game(configObj);
            expect(game).to.have.property('multiplayer').that.is.an.instanceof(Multiplayer);

            expect(game.multiplayer.gameCreator).to.equal(gameCreator);
        });

        it("If connectgame=false, and gameCreator is set to another user p2," +
            "multiplayer.gameCreator should be set to p2",
            function() {
                const currentUser = '16ajoi'+ faker.random.alphaNumeric(16);
                const p2 = '16ajoi'+ faker.random.alphaNumeric(16);

                const configObj = {
                    multiplayer: true,
                    connectGame: false,
                    otherPlayers: [],
                    gameCreator: p2
                };

                let game = new Game(configObj);
                expect(game).to.have.property('multiplayer').that.is.an.instanceof(Multiplayer);

                expect(game.multiplayer.gameCreator).to.equal(p2);
            });
    });

    describe("Other multiplayer", function() {
        it('If game.loading == true, game.startGame should fail', function() {
            const game = new Game();

            sinon.stub(game, 'loading').get(sinon.fake.returns(true));

            expect(game.startGame()).to.eventually.be.false;
            expect(game.answer).to.be.null;
        });

        it('If game.loading == false, game.startGame should set game answer to first multiplayer answer', function() {
            const game = new Game();

            sinon.stub(game, 'loading').get(sinon.fake.returns(false));
            const initAnswer = 'perfume';

            game.multiplayer.answers = [initAnswer, 'wjoifwa', 'iofw', 'jfiowe', 'flower'];

            return expect(game.startGame()).to.eventually.be.true
                .then(() => expect(game.answer).to.equal(initAnswer));
        });
    });

    describe('After connecting to game', function(done) {
        it('When game.roundOver() is called, call multiplayer.sendRoundData(previousRound) to game creator', function(done) {
            const gameCreator = '16ajoi'+ faker.random.alphaNumeric(16);
            const currentUser = '16ajoi'+ faker.random.alphaNumeric(16);

            const configObj = {
                multiplayer: true,
                connectGame: false,
                otherPlayers: [],
                gameCreator
            };

            let game = new Game(configObj);
            const multiplayer = game.multiplayer;
            const spy = sinon.stub(multiplayer, 'sendRoundScores').resolves(true);

            let roundOverCB = false;
            game.onRoundOver(() => {
                sinon.assert.called(spy);
                done();
            });

            game.roundOver()
            /*
                .then(() => {
                    expect(roundOverCB).to.be.true;
                });
            */
        });
    });

    it('If at round 1 and game.newRound() is called, do not call multiplayer.sendRoundData(previousRound)');
});
