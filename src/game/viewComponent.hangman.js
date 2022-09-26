import React from 'react';

class Hangman extends React.Component {
    constructor(props) {
        super();

        this.state = {
            game: props.game
        }
    }

    render() {
        const game = this.state.game;
        return (
            <div className='game__hangman'>
                <div className = 'hangman hangman__head'>
                </div>
            {game.incorrectGuesses}

                <svg className = 'hangman hangman__noose'>
                </svg>

                <svg className = 'hangman hangman__gallows gallows'>
                    {game.incorrectGuesses > 4 && 
                        <rect id='gallows__smallbeam' x='130' y='20' width='20' height='20' />
                    }
                    {game.incorrectGuesses > 3 && 
                        <path id='gallows__beam-support' x='55' y='20' fill="green" stroke="black" d="m100,20 L20,70 v-20 L70,20 h20 z" />
                    }
                    {game.incorrectGuesses > 2 && 
                        <rect id='gallows__hbeam' x='0' y='0' width='150' height='20' />
                    }
                    {game.incorrectGuesses > 1 && 
                        <rect id='gallows__vbeam' x='15' y='20' width='20' height='150' />
                    }
                    {game.incorrectGuesses > 0 && 
                        <rect id='gallows__base' x='0' y='130' width='50' height='20' />
                    }
                </svg>
            </div>
        );
    }
}

export default Hangman
