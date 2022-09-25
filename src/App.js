import React from 'react';

import './App.css';
import Home from './pages/Home.js';
import GameView from './game/GameBoard.js';
import Game from './game/game.js';

import config from './config/config.js';
import ConfigPanel from './config/configPanel.jsx';

import { getAddress } from './connectivity/hoprNode.js';
import useWebSocket from './connectivity/useWebSocket.js';

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            showGame: false,
            game: null,
            route: 'home',
            address: null,
            showConfig: false,
            otherPlayers: [],
            inputs: {
                newPlayer: "",
            }
        }

        this.startGame = this.startGame.bind(this);
        this.goHome = this.goHome.bind(this);
        this.setInput = this.setInput.bind(this);
        this.addNewPlayer = this.addNewPlayer.bind(this);
        this.loadAddress = this.loadAddress.bind(this);
    }

    setInput(key, val) {
        const inputs = { ...this.state.inputs };
        inputs[key] = val;

        this.setState({inputs});
    }

    goHome() {
        this.setState({route: 'home'});
    }

    goTo(routeName) {
        this.setState({route: routeName});
    }

    startGame() {
        this.setState({route:'game', showGame: true});
    }

    addNewPlayer(addr) {
        const otherPlayers = this.state.otherPlayers;
        otherPlayers.push(addr)
        this.setState({ otherPlayers });

        this.setInput('newPlayer', "");
    }

    loadAddress() {
        return getAddress()
            .then(res => {
                this.setState({ address: res })
            })
            .catch(e => {
                console.error('failed to fetch address');
            });
    }

    componentDidMount() {
        return this.loadAddress();
    }

    render() {
        const route = this.state.route;
        const hoprAddress = this.state.address;

        let menu = (
            <button className='link' onClick={this.goHome}>Back to Home</button>
        );

        // Home
        let view = (
            <div className="App page">
                <p className='page__title'>Hopr Hangman</p>
                <button className='button' onClick={() => this.setState({showConfig: true})}>Settings</button>
                { this.state.showConfig == true &&
                    <ConfigPanel className='page__modal' onSave={this.loadAddress} handleClose={() => this.setState({showConfig: false})}/>
                }
                <p>Your Hopr Address: { hoprAddress }</p>
                <button className={'button button_selector ' + (!this.state.multiplayer && 'button_selector_active')} onClick={() => this.setState({multiplayer: false})}>Play Alone</button>
                <button className={'button button_selector ' + (this.state.multiplayer && 'button_selector_active')} onClick={() => this.setState({multiplayer: true})}>Play with other players</button>

                {
                    this.state.multiplayer && (
                        <div>
                            {
                                this.state.otherPlayers.map((addr, index) => {
                                    return (
                                        <label className='input-group' key={'player-' + index}>
                                            <span className='input-group__label'>Player {index + 2}: </span>
                                            <input className='input-group__input' type='text' value={addr} disabled />
                                        </label>
                                    );
                                })
                            }
                            <label className='input-group'>
                                <span className=' input-group__label'>Player Hopr Address: </span>
                                <input type='text' placeholder='PeerID'
                                    value={this.state.inputs.newPlayer}
                                    onChange={(e) => this.setInput('newPlayer', e.target.value)}
                                />
                            </label>
                            <button className='button' onClick={() => {this.addNewPlayer(this.state.inputs.newPlayer)}}>Add New Player</button>
                        </div>
                    )
                }
                    <div>
                        <button className='button button_primary' onClick={this.startGame }>Start Game</button>
                    </div>
            </div>
        );

        if(route == 'game') {
            view = [
                menu,
                <GameView otherPlayers={
                    this.state.multiplayer ? 
                    this.state.otherPlayers : null
                } />
            ];
        }

        return (
            <div className="App">
            {view}
            </div>
        );
    }
}

export default App;
