import React from 'react';

class Keyboard extends React.Component {
    constructor(props) {
        super();
        this.state = {
            badKeys: [],
            goodKeys: []
        }
        this.clickKey = this.clickKey.bind(this);
    }

    clickKey(key) {
        let badKeys = this.state.badKeys;
        let goodKeys = this.state.goodKeys;

        const game = this.props.game;
        const result = game.guessLetter(key);
        console.log('result:', result);

        if(!result)
            badKeys.push(key);
        else
            goodKeys.push(key);

        this.setState({badKeys, goodKeys});
        this.props.onGameUpdate(game);
    }

    render() {
        const keys = [];
        const game = this.props.game;

        for(let unicode = 97; unicode <= 122; unicode++) {
            const key = String.fromCharCode(unicode);

            keys.push(
                <button key={unicode}
                    className={
                        [
                            "keyboard__key",
                            ["keyboard__key", this.state.badKeys.includes(key) ? "red" :
                                this.state.goodKeys.includes(key) ? "green" : "unselected"].join('_'),
                        ].join(" ")
                    }
                    onClick={() => this.clickKey(key)}>
                    {key}
                </button>
            );
        }

        return (
            <div className='keyboard'>
                { keys }
            </div>
        );
    }
}

export default Keyboard
