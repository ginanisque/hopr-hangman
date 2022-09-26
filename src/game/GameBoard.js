import React from 'react';

import Game from './game.js';
import Hangman from './viewComponent.hangman.js';
import Word from './viewComponent.word.js';
import Keyboard from './viewComponent.keyboard.js';
import WebSocketHandler from '../connectivity/WebSocketHandler.jsx';
import appConfig from "../config/config.js";

import RoundOverScreen from './RoundOverScreen.js';
import GameOverScreen from './GameOverScreen.js';

class GameView extends React.Component {
    constructor(props) {
        super();

        this.state = {
            game: new Game(props.config),
            showRoundOverScreen: false,
            showGameOverScreen: false,
        }
        if(props.onGameOver)
            this.state.game.onGameOver(props.onGameOver);

        this.state.game.onRoundOver(() => this.roundOver(this));
        this.state.game.startGame();

        this.updateGame = this.updateGame.bind(this);
    }

    roundOver(this_) {
        this_.setState({showRoundOverScreen: true});

        setTimeout(() => 
            this_.setState({showRoundOverScreen: false}),
            3000);
    }

    gameOver(this_) {
        this_.setState({showGameOverScreen: true});
    }

    updateGame(game) {
        this.setState(game);
    }

    render() {
        const game = this.state.game;

        return (
            <div>
                { this.state.showRoundOverScreen && 
                    <RoundOverScreen
                    />
                }

                { this.state.showGameOverScreen && 
                    <GameOverScreen game={game}
                    />
                }
                <div className='game__player-list player-list'>
                    <p class='player-list__title'>Players</p>
                    <p className='game__player player-list__player-details'>You</p>
                    { game.otherPlayers.map((addr, index) => (
                        <p className='game__player player' key={"player" + index}>
                            <span className="player-list__address">{addr.substring(0, 12) + "..." + addr.substring(addr.length-6)}</span>
                            { this.state.game.multiplayer.getScore(addr) != null &&
                                    <span className='player__score'> {
                                        this.state.game.multiplayer.getScore(addr)}</span>
                            }
                        </p>
                        )
                    ) }
                </div>

                <WebSocketHandler
                    wsEndpoint = {appConfig.wsEndpoint}
                    securityToken = {appConfig.authToken}
                    game = {this.state.game}
                />

                <p>Score: {game.gameScore}</p>
                <p>Round: {game.round}</p>

                <Hangman className='game__hangman' game={game} onGameUpdate={this.updateGame} />
                <Word className='game__word' game={game} onGameUpdate={this.updateGame} />
                <Keyboard className='game__keyboard' game={game} onGameUpdate={this.updateGame} />
            </div>
        );
    }
}

export default GameView;
