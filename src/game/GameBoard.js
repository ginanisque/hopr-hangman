import React from 'react';

import Game from './game.js';
import Hangman from './viewComponent.hangman.js';
import Word from './viewComponent.word.js';
import Keyboard from './viewComponent.keyboard.js';

class GameView extends React.Component {
    constructor(props) {
        super();

        this.state = {
            game: new Game(props.otherPlayers),
        }
        this.newGame = this.newGame.bind(this);
        this.updateGame = this.updateGame.bind(this);
    }

    newGame() {
        const game = new Game(this.props.otherPlayers);
        this.setState({game});
    }

    updateGame(game) {
        this.setState(game);
    }

    render() {
        const game = this.state.game;

        return (
            <div>
                <Hangman game={game} onGameUpdate={this.updateGame} />
                <Word game={game} onGameUpdate={this.updateGame} />
                <Keyboard game={game} onGameUpdate={this.updateGame} />
            </div>
        );
    }
}

export default GameView;
