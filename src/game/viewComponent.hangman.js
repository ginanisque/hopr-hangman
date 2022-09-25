import React from 'react';

class Hangman extends React.Component {
    render() {
        return (
            <div>
                <div class = 'hangman hangman__head'>
                </div>

                <svg class = 'hangman hangman__noose'>
                </svg>

                <svg class = 'hangman hangman__gallows gallows'>
                    <rect id='gallows__hbeam' x='0' y='0' width='150' height='20' />
                    <path id='gallows__beam-support' x='55' y='20' fill="green" stroke="black" d="m100,20 L20,70 v-20 L70,20 h20 z" />
                    <rect id='gallows__vbeam' x='15' y='20' width='20' height='150' />
                    <rect id='gallows__base' x='0' y='130' width='50' height='20' />
                </svg>
            </div>
        );
    }
}

export default Hangman
