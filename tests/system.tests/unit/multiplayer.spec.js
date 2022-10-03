import { expect } from 'chai';
import sinon from 'sinon';
import Multiplayer from '../../../src/game/multiplayer.js';

describe("Multiplayer", function() {
    it('If otherPlayers == null, do not carry out any actions');

    it('Start(): If gameCreator is user, call createGame', function() {
        const ownAddress = process.env.REACT_APP_TEST_PEER_ID1;
        const gameCreator = ownAddress;

        const p4 = process.env.REACT_APP_TEST_PEER_ID4,
            p5 = process.env.REACT_APP_TEST_PEER_ID5;

        const otherPlayers = [
            p4, p5
        ]

        const multiplayer = new Multiplayer(otherPlayers, gameCreator);

        sinon.stub(multiplayer, 'getAddress').resolves(ownAddress);

        const createGame = sinon.stub(multiplayer, 'createGame').resolves(true);
        const shouldNotBeCalled = sinon.stub(multiplayer, 'connectGame').resolves(true);

        expect(ownAddress == gameCreator);// Sanity check

        return expect(multiplayer.start()).to.be.fulfilled
            .then(() => {
                sinon.assert.called(createGame);
                sinon.assert.notCalled(shouldNotBeCalled);
            })
    });

    it.skip('#canIgnore - Start(): If gameCreator is user, send addresses of all players to all users', function() {
        this.timeout(5000);
        const ownAddress = process.env.REACT_APP_TEST_PEER_ID1;
        const gameCreator = ownAddress;

        const p3 = process.env.REACT_APP_TEST_PEER_ID3,
            p4 = process.env.REACT_APP_TEST_PEER_ID4,
            p5 = process.env.REACT_APP_TEST_PEER_ID5;

        const otherPlayers = [
            p3, p4, p5
        ]

        const gameData = {
            app: 'hangman',
            type: 'startGame',
            players: [gameCreator, ...otherPlayers]
        }

        const multiplayer = new Multiplayer(otherPlayers);

        const spy = sinon.stub(multiplayer, 'sendHoprMessage').resolves(true);
        sinon.stub(multiplayer, 'establishChannel').resolves(true);
        sinon.stub(multiplayer, 'getAddress').resolves(ownAddress);

        expect(ownAddress == gameCreator);// Sanity check

        return expect(multiplayer.start()).to.be.fulfilled
            .then(() => {
                console.log("gamedata:", gameData);

                otherPlayers.forEach(peerId => {
                    expect(peerId).to.be.a('string');
                    sinon.assert.calledWith(spy, peerId, sinon.match.has('players', gameData.players));
                })
            })
    });

    it('AllowNewRound should return false if any players are more than one round behind', function() {
        const ownAddress = process.env.REACT_APP_TEST_PEER_ID1;
        const gameCreator = ownAddress;

        const multiplayer = new Multiplayer([process.env.REACT_APP_TEST_PEER_ID3]);

        sinon.stub(multiplayer, 'getAddress').resolves(ownAddress);

        const randRoundData = {num:1, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData'};

        const p2 = process.env.REACT_APP_TEST_PEER_ID2,
            p3 = process.env.REACT_APP_TEST_PEER_ID3,
            p4 = process.env.REACT_APP_TEST_PEER_ID4;

        multiplayer.saveRound({...randRoundData, peerId: gameCreator, num: 3})
        multiplayer.saveRound({...randRoundData, peerId: p2, num: 1})
        multiplayer.saveRound({...randRoundData, peerId: p3, num: 2})
        multiplayer.saveRound({...randRoundData, peerId: p4, num: 3})

        expect(multiplayer.allowNewRound).to.be.false;
    });

    it('AllowNewRound should return true if all players are at same round', function() {
        const ownAddress = process.env.REACT_APP_TEST_PEER_ID1;
        const gameCreator = ownAddress;

        const multiplayer = new Multiplayer([process.env.REACT_APP_TEST_PEER_ID3]);

        sinon.stub(multiplayer, 'getAddress').resolves(ownAddress);

        const p2 = process.env.REACT_APP_TEST_PEER_ID2,
            p3 = process.env.REACT_APP_TEST_PEER_ID3,
            p4 = process.env.REACT_APP_TEST_PEER_ID4;

        const randRoundData = {num:1, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData'};
        multiplayer.saveRound({...randRoundData, peerId: gameCreator, num: 3})
        multiplayer.saveRound({...randRoundData, peerId: p2, num: 1})
        multiplayer.saveRound({...randRoundData, peerId: p3, num: 2})
        multiplayer.saveRound({...randRoundData, peerId: p4, num: 3})

        expect(multiplayer.allowNewRound).to.be.true;
    });

    it('Start(): If gameCreator is another player, call connectGame', function() {
        const ownAddress = process.env.REACT_APP_TEST_PEER_ID1;
        const gameCreator = process.env.REACT_APP_TEST_PEER_ID2;

        const otherPlayers = [
            gameCreator,
            process.env.REACT_APP_TEST_PEER_ID4,
            process.env.REACT_APP_TEST_PEER_ID5
        ]

        const multiplayer = new Multiplayer(otherPlayers, gameCreator);

        const connectGame = sinon.stub(multiplayer, 'connectGame').resolves(true);
        const shouldNotBeCalled = sinon.stub(multiplayer, 'createGame').resolves(true);

        sinon.stub(multiplayer, 'getAddress').resolves(ownAddress);
        expect(ownAddress).to.not.equal(gameCreator); // Sanity check

        return expect(multiplayer.start()).to.be.fulfilled
            .then(() => {
                sinon.assert.calledWith(connectGame, gameCreator);
                sinon.assert.notCalled(shouldNotBeCalled);
            })
    });

    it('CreateGame: fail if otherPlayers is empty', function() {
        const multiplayer = new Multiplayer([]);

        const spy = sinon.stub(multiplayer, 'establishChannel').resolves(true);

        return expect(multiplayer.createGame()).to.be.rejected;
    });

    it('CreateGame: should establishChannel() to all other players', function() {
        this.timeout(5000);
        const p2 = process.env.REACT_APP_TEST_PEER_ID2,
            p3 = process.env.REACT_APP_TEST_PEER_ID3,
            p4 = process.env.REACT_APP_TEST_PEER_ID4,
            p5 = process.env.REACT_APP_TEST_PEER_ID5;

        const otherPlayers = [
            p2, p3, p4, p5
        ]

        const multiplayer = new Multiplayer(otherPlayers);

        const spy = sinon.stub(multiplayer, 'establishChannel').resolves(true);

        return multiplayer.createGame()
            .then(() => {
                sinon.assert.called(spy);
                sinon.assert.calledWith(spy, p2)
                sinon.assert.calledWith(spy, p3)
                sinon.assert.calledWith(spy, p4)
                sinon.assert.calledWith(spy, p5)
            });
    });

    it('CreateGame: if establishChannel() throws because channel is open, continue', function() {
        this.timeout(5000);
        const p2 = process.env.REACT_APP_TEST_PEER_ID2,
            p3 = process.env.REACT_APP_TEST_PEER_ID3,
            p4 = process.env.REACT_APP_TEST_PEER_ID4,
            p5 = process.env.REACT_APP_TEST_PEER_ID5;

        const otherPlayers = [
            p2, p3, p4, p5
        ]

        const multiplayer = new Multiplayer(otherPlayers);

        const spy = sinon.stub(multiplayer, 'establishChannel').rejects("CHANNEL_ALREADY_OPEN");

        return expect(multiplayer.createGame()).to.be.fulfilled;
    });

    it('ConnectGame: if establishChannel() throws because channel is open, continue', function() {
        const creator = process.env.REACT_APP_TEST_PEER_ID3;
        const multiplayer = new Multiplayer(creator);

        const spy = sinon.stub(multiplayer, 'establishChannel').rejects("CHANNEL_ALREADY_OPEN");

        return expect(multiplayer.connectGame(creator)).to.be.fulfilled
            .then(() => {
                sinon.assert.calledWith(spy, creator);
            });
    });

    it('ConnectGame: Call establish channel to game creator', function() {
        const gameCreator = process.env.REACT_APP_TEST_PEER_ID3;
        const multiplayer = new Multiplayer([]);

        const spy = sinon.stub(multiplayer, 'establishChannel').resolves(true);

        return multiplayer.connectGame(gameCreator)
            .then(() => {
                sinon.assert.calledWith(spy, gameCreator);
            });
    });

    it("SaveRound: update player gameScore everytime it's called", function() {
        const multiplayer = new Multiplayer([process.env.REACT_APP_TEST_PEER_ID3]);

        const player2 = process.env.REACT_APP_TEST_PEER_ID3;

        const r1 = {num:1, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData', peerId: player2};
        const r2 = {num:2, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData', peerId: player2};
        const r3 = {num:2, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 9, type: 'roundData', peerId: player2};
        const r4 = {num:2, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 17, type: 'roundData', peerId: player2};

        multiplayer.saveRound(r1)
        expect(multiplayer.getScore(player2)).to.equal(7);
        multiplayer.saveRound(r2)
        expect(multiplayer.getScore(player2)).to.equal(7);
        multiplayer.saveRound(r3)
        expect(multiplayer.getScore(player2)).to.equal(9);
        multiplayer.saveRound(r4)
        expect(multiplayer.getScore(player2)).to.equal(17);
    });

    describe("Parse message:", function() {
        describe("If message is a json obj", function() {
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

            it.only('If message is startGame, call savePlayerData', function() {
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
                const player2 = process.env.REACT_APP_TEST_PEER_ID3;

                const roundData = {num:3, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData', peerId: player2};
                const wsMsg = JSON.stringify(roundData);

                const spy = sinon.stub(multiplayer, 'saveRound');

                return multiplayer.parseMessage(wsMsg)
                .then(() => {
                    sinon.assert.calledWith(spy, roundData);
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

            it("If message has property 'type': roundData", function() {
                const multiplayer = new Multiplayer([process.env.REACT_APP_TEST_PEER_ID3]);

                const roundData = {guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData'};
                const wsMsg = JSON.stringify(roundData);

                const spy = sinon.stub(multiplayer, 'receiveRoundScores').resolves(true);

                return multiplayer.parseMessage(wsMsg)
                .then(() => {
                    sinon.assert.calledWith(spy, roundData);
                });
            });
        });
    });

    it('AllowNewRound: return true if all players are at same round', function() {
    });

    it('chooseWinner if all players have sent gameOver, call chooseWinner', async function() {
        const ownAddress = process.env.REACT_APP_TEST_PEER_ID1;
        const gameCreator = ownAddress;

        const p2 = process.env.REACT_APP_TEST_PEER_ID2,
            p3 = process.env.REACT_APP_TEST_PEER_ID3,
            p4 = process.env.REACT_APP_TEST_PEER_ID4;

        const multiplayer = new Multiplayer([p2, p3, p4]);

        sinon.stub(multiplayer, 'getAddress').resolves(ownAddress);
        sinon.stub(multiplayer, 'broadcastMessage').resolves(true);
        const spy = sinon.stub(multiplayer, 'chooseWinner');

        const randRoundData = {num:1, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData'};

        await multiplayer.sendGameOver({gameScore: 3, peerId: ownAddress});
        sinon.assert.notCalled(spy);
        await multiplayer.receiveGameOver({gameScore: 7, peerId: p2})
        sinon.assert.notCalled(spy);
        await multiplayer.receiveGameOver({gameScore: 7, peerId: p3})
        sinon.assert.notCalled(spy);

        await multiplayer.receiveGameOver({gameScore: 7, peerId: p4})
        sinon.assert.calledOnce(spy);
    });

    it('ChooseWinner: set winner as player with highest score', function() {
        this.timeout(6000);
        const ownAddress = process.env.REACT_APP_TEST_PEER_ID1;
        const gameCreator = ownAddress;

        const p2 = process.env.REACT_APP_TEST_PEER_ID2,
            p3 = process.env.REACT_APP_TEST_PEER_ID3,
            p4 = process.env.REACT_APP_TEST_PEER_ID4;

        const m1 = new Multiplayer([p2, p3, p4]);
        const m2 = new Multiplayer([], gameCreator);
        const m3 = new Multiplayer(null, gameCreator);

        [m1, m2,m3].forEach(mm => {
            sinon.stub(mm, 'sendHoprMessage').resolves(true);
            sinon.stub(mm, 'establishChannel').resolves(true);
            sinon.stub(mm, 'getAddress').resolves(ownAddress);
        });

        const randRoundData = {gameScore: 3}

        return m1.start()
            .then(() => m2.start())
            .then(() => m3.start())
            .then(() => {
                [m1, m2,m3].forEach(mm => {
                    mm.sendGameOver({...randRoundData, peerId: gameCreator, score: 7})
                    mm.sendGameOver({...randRoundData, peerId: p2, score: 12})
                    mm.sendGameOver({...randRoundData, peerId: p3, score: 14})
                    mm.sendGameOver({...randRoundData, peerId: p4, score: 4})

                    expect(mm.chooseWinner()).to.equal(p3);
                });
            });
    });

    // TODO: Fix non-creator player not sending round data after round

    it('ReceiveRoundScores: If player is game creator, send round scores to all other players', function() {
        const p2 = process.env.REACT_APP_TEST_PEER_ID2,
            p3 = process.env.REACT_APP_TEST_PEER_ID3,
            p4 = process.env.REACT_APP_TEST_PEER_ID4,
            p5 = process.env.REACT_APP_TEST_PEER_ID5;

        const otherPlayers = [
            p2, p3, p4, p5
        ]

        const roundData = {
            fee: "fjoiw",
            score: 3
        }

        const multiplayer = new Multiplayer(otherPlayers);

        sinon.stub(multiplayer, 'establishChannel').rejects("CHANNEL_ALREADY_OPEN");
        const spy = sinon.stub(multiplayer, 'sendRoundScores').resolves(true);

        return multiplayer.receiveRoundScores(roundData)
            .then(() => {
                sinon.assert.calledWith(spy, roundData, p2);
                sinon.assert.calledWith(spy, roundData, p3);
                sinon.assert.calledWith(spy, roundData, p4);
                sinon.assert.calledWith(spy, roundData, p5);
            });
    });

    it('ReceiveRoundScores: If player is not game creator, do not send round scores', function() {
        const roundData = {
            fee: "fjoiw",
            score: 3
        }

        const multiplayer = new Multiplayer([]);

        sinon.stub(multiplayer, 'establishChannel').rejects("CHANNEL_ALREADY_OPEN");
        const spy = sinon.stub(multiplayer, 'sendRoundScores').resolves(true);

        return multiplayer.receiveRoundScores(roundData)
            .then(() => {
                sinon.assert.notCalled(spy);
            });
    });
});
