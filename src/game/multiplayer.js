import { getAddress, sendHoprMessage, establishChannel } from '../connectivity/hoprNode.js';
import useWebsocket from '../connectivity/useWebSocket.js';
import webSocketHandler from '../connectivity/WebSocketHandler.jsx';
import config from "../config/config.js";

class Multiplayer {
    constructor(otherPlayers, gameCreator) {
        if(gameCreator && typeof gameCreator == 'string' && gameCreator.length > 0)
            this.gameCreator = gameCreator;

        else this.gameCreator = null;

        this.websocket = null;
        this.address = null;
        this.playerData = {};

        this._rounds = {}

        if(!otherPlayers || !Array.isArray(otherPlayers) || otherPlayers.length ==0) {
            this._otherPlayers = [];
            this.isGameCreator = false;
        } else {
            this._otherPlayers = otherPlayers;

            otherPlayers.forEach(p => {
                this.playerData[p] = {};
            });

            this.isGameCreator = true;
        }
    }

    start() {
        return this.getAddress()
            .then(res => {
                this.address = res;

                this.playerData[this.address] = {};

                const players = [ ...this.otherPlayers, this.address ];
                this.setPlayers(players);

                if(res == this.gameCreator || !this.gameCreator) {
                    this.isGameCreator = true;
                    return this.createGame();
                } else {
                    this.isGameCreator = false;
                    return this.connectGame(this.gameCreator);
                }
            });
    }

    setPlayers(playerArray) {
        this.playerData = {};

        playerArray.forEach(p => {
            this.playerData[p] = {
                score: 0
            };
        });
    }

    /**
     * Connects to existing game
     */
    connectGame(gameCreator) {
        if(this.isGameCreator)
            return Promise.reject("Game creator cannot connect to game");
        else
            return this.establishChannel(gameCreator)
                .catch(e => {
                    if(e == "CHANNEL_ALREADY_OPEN")
                        return true;
                    else  {
                        console.log("__________________________ERROR__________________________:", e);
                        console.error(e);
                        throw e;
                    }
                    
                })
    }

    /**
     * Creates game for others to connect to
     */
    createGame(cb) {
        if(!this.isGameCreator)
            return Promise.reject("Only game creator can create game");

        const gameData = {
            app: 'hangman',
            type: 'startGame',
            players: [...this.otherPlayers, this.address],

        }

        let promiseChain = Promise.resolve(true);

        this.otherPlayers.forEach(addr => {
            promiseChain = promiseChain
                .then(() => {
                    return new Promise((resolve, reject) => {
                        setTimeout(
                            () => {
                                return this.establishChannel(addr)
                                    .catch(e => {
                                        if(e == "CHANNEL_ALREADY_OPEN")
                                            return resolve(true);
                                        else reject(e);
                                    })
                                    .then(res => {
                                        if(cb) {
                                            return cb()
                                                .then(res => resolve(res));
                                        } else
                                            return resolve(res)
                                    })
                            },
                            400
                        )
                    });
                })
                .then(() => {
                    return new Promise((resolve, reject) => {
                        setTimeout(
                            () => {
                                if(!addr || addr == "")
                                    return resolve(false);

                                return this.sendHoprMessage(addr, gameData)
                                    .then(res => {
                                        if(cb) {
                                            return cb()
                                                .then(res => resolve(res));
                                        } else
                                            return resolve(res)
                                    })
                            },
                            400
                        )
                    });
                });
        });

        return promiseChain;
    }

    parseMessage(wsMsg) {
        let data;
        try {
            data = JSON.parse(wsMsg);
        } catch(e) {
            data = {};
        }

        if(data.app == 'hangman') {
            if(data.type == 'roundData')
                return this.receiveRoundScores(data);

            else if(data.type == 'startGame') {
                if(!this.isGameCreator) {
                    console.log('is not creator, so will init with: ', data);
                    const players = [ ...data.players, this.address ];
                    console.log("setting players", players);
                    this.setPlayers(players);
                }

            }
        }

        return Promise.resolve(true);
    }

    saveRound(round) {
        const peerId = round.peerId;

        if(!this._rounds[peerId])
            this._rounds[peerId] = {};

        this._rounds[peerId][round.num] = round;
        this._rounds[peerId].currentRound = round;
        this._rounds[peerId].gameScore = round.gameScore;
        console.log("round saved", round);
    }

    receiveRoundScores(round) {
        this.saveRound(round);
        let promiseChain = Promise.resolve(true);

        if(this.isGameCreator) {
            this.otherPlayers.forEach(addr => {
                this.sendRoundScores(round, addr);
            });
        }
        return promiseChain;
    }

    sendRoundScores(roundData) {
        const data = {
            ...roundData,
            app: 'hangman',
            type: 'roundData',
        }
        return this.broadcastMessage(data);
    }

    receiveGameOver(gameData) {
        const data = {
            ...gameData,
            app: 'hangman',
            type: 'gameOver',
        }

        return this.gameOver(gameData);
    }

    sendGameOver(gameData) {
        const data = {
            ...gameData,
            app: 'hangman',
            type: 'gameOver',
            peerId: this.address,
        }

        this.gameOver(gameData);

        return this.broadcastMessage(data)
    }

    gameOver(gameData) {
        this.playerData[gameData.peerId] = {
            gameOver: true,
            score: gameData.score || gameData.gameScore,
            gameScore: gameData.score || gameData.gameScore
        }

        if(this.canChooseWinner())
            return this.chooseWinner();
        else return true;
    }

    broadcastMessage(data) {
        if(!data.peerId)
            data.peerId = this.address;

        const otherPlayers = [...this.otherPlayers];
        const gameCreator = this.gameCreator;

        if(gameCreator != this.address)
            otherPlayers.push(gameCreator);

        let promiseChain = Promise.resolve();
        if(otherPlayers && otherPlayers.length > 0) {
            otherPlayers.forEach(peerID => {
                if(peerID != data.peerId) {
                    promiseChain = promiseChain.then(() =>
                        this.sendHoprMessage(peerID, JSON.stringify(data)));
                }
            });
        }

        return promiseChain;
    }

    get allowNewRound() {
        let ans = true;

        for(let peerId in this._rounds) {
            const roundData = this.getCurrentRound(peerId);

            if(roundData && roundData.num <= this.getCurrentRound(this.address))
                ans = true;
        }

        return ans;
    }

    canChooseWinner() {
        let ans = true;

        this.otherPlayers.forEach(peerId => {
            const playerData = this.playerData[peerId];

            if(!playerData || !playerData.gameOver)
                ans = false;
        });

        return ans;
    }

    chooseWinner() {
        let winner, highestScore=0;

        for(let peerId in this.playerData) {
            const gameScore = this.playerData[peerId].gameScore 
            if(gameScore > highestScore) {
                highestScore = gameScore;
                winner = peerId;
            }
        }

        return winner;
    }

    get otherPlayers() {
        return Object.keys(this.playerData).filter(peerId => {
            return peerId != this.address
                && peerId.trim() != "";
        });
    }

    getCurrentRound(peerId) {
        const playerRounds = this._rounds[peerId].currentRound;

        if(playerRounds)
            return playerRounds.currentRound;
        else return false;
    }

    getRounds(peerId) {
        return this._rounds[peerId];
    }

    getScore(peerId) {
        if(this._rounds[peerId])
            return this._rounds[peerId].gameScore || 0;
    }

    getScores() {
        const scores = {};

        for(let key in this._rounds) {
            const value = this._rounds[key];
            
            scores[key] = value.gameScore;
        }

        return scores;
    }
}

Multiplayer.prototype.establishChannel = establishChannel;
Multiplayer.prototype.sendHoprMessage = sendHoprMessage;
Multiplayer.prototype.getAddress = getAddress;

export default Multiplayer;
