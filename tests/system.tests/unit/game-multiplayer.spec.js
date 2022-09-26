import { faker } from '@faker-js/faker';
import { expect } from 'chai';
import Game from '../../../src/game/game';
import Multiplayer from '../../../src/game/multiplayer';
import sowpodslist from '../../../src/wordlists/sowpods.js';
import sinon from 'sinon';

describe('Game - Multiplayer:', function() {
    describe('Game config', function() {
        it('multiplayer=true, connectgame=true, gameCreator is set, set multiplayer', function() {
            const gameCreator = '16ajoi'+ faker.random.alphaNumeric(16)

            const configObj = {
                multiplayer: true,
                connectGame: true,
                otherPlayers: [gameCreator, '16ajoi'+ faker.random.alphaNumeric(16)],
                gameCreator
            };

            let game = new Game(configObj);
            expect(game).to.have.property('multiplayer').that.is.an.instanceof(Multiplayer);

            expect(game.multiplayer.gameCreator).to.equal(gameCreator);
        });

        it("If multiplayer=true, connectgame=false, and gameCreator is set to another user," +
            "multiplayer.gameCreator should be set to current user",
            function() {
                const gameCreator = '16ajoi'+ faker.random.alphaNumeric(16);
                const currentUser = '16ajoi'+ faker.random.alphaNumeric(16);

                const configObj = {
                    multiplayer: true,
                    connectGame: false,
                    otherPlayers: [],
                    gameCreator
                };

                let game = new Game(configObj);
                expect(game).to.have.property('multiplayer').that.is.an.instanceof(Multiplayer);

                expect(game.multiplayer.gameCreator).to.equal(gameCreator);
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
