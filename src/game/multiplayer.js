import { getAddress, sendHoprMessage, establishChannel } from '../connectivity/hoprNode.js';
import useWebsocket from '../connectivity/useWebSocket.js';
import webSocketHandler from '../connectivity/WebSocketHandler.jsx';
import config from "../config/config.js";

class Multiplayer {
    constructor(otherPlayers, gameCreator) {
        this.websocket = null;
        this.address = null;
        this.playerData = {};
        this._rounds = {}

        if(gameCreator && typeof gameCreator == 'string' && gameCreator.length > 0) {
            this.gameCreator = gameCreator;
            this.isGameCreator = false;
            this._otherPlayers = [];
        } else {
            this.gameCreator = null;
            this.setPlayers(otherPlayers);
            /*
            otherPlayers.forEach(p => {
                this.playerData[p] = {};
            });
            */

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
        this._otherPlayers = [];
        this.playerData = {};
        this._otherPlayers = [];

        playerArray.forEach(p => {
            this.playerData[p] = {
                score: 0
            };

            // add player to otherPlayers array if they are not user
            if(p != this.address)
                this._otherPlayers.push(p);

        });

        this.update();
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
        console.log("wsmessage:", wsMsg, typeof wsMsg);
        let data;
        try {
            data = JSON.parse(wsMsg);
        } catch(e) {
            data = {};
        }

        if(typeof data == 'string') {
            try {
                data = JSON.parse(data);
            } catch(e) {
                console.log("cannot parse data anymore:", data);
            }
        }

        console.log("data received:", data, typeof data);

        if(data.app == 'hangman') {
            console.log("hangman data received. \nData type:", data.type);
            if(data.type == 'roundData')
                return this.receiveRoundScores(data);

            else if(data.type == 'startGame') {
                if(!this.isGameCreator) {
                    const players = [ ...data.players, this.address ];
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
        this.playerData.score = round.gameScore;
        console.log("round saved", round);
    }

    receiveRoundScores(round) {
        console.log("REceiving round score:", round);
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

    update() {
        if(this.updateHook)
            return this.updateHook();
        else return Promise.resolve(true);
    }

    onUpdate(cb) {
        if(cb)
            this.updateHook = cb;
    }

    broadcastMessage(data) {
        if(!data.peerId)
            data.peerId = this.address;

        const otherPlayers = [...this.otherPlayers];
        const gameCreator = this.gameCreator;

        let promiseChain = Promise.resolve();
        if(otherPlayers && otherPlayers.length > 0) {
            console.log('broadcasting message to other players:', otherPlayers);
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
        console.log("\GET otherPlayers\n**************************");
        console.log("player data:", this.playerData);
        return Object.keys(this.playerData).filter(peerId => {
            return peerId != null
                && peerId != this.address
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
        console.log("rounds for all players:", this._rounds);
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
