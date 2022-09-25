import sowpodslist from '../wordlists/sowpods';
import { randomWord } from './words';
import { sendHoprMessage, establishChannel } from '../connectivity/hoprNode.js';

const MAX_SCORE=5;

class Game {
    repeatedWord = false
    _word = null;
    _currentRound = 1;
    _incorrectGuesses = 0;
    _score = 0;
    rounds = [];

    constructor(otherPlayers=[]) {
        this.otherPlayers = otherPlayers || [];

        this.pastAnswers = [];
        this.wordlist = sowpodslist;
        this.wrongGuesses = [];
        this.rightGuesses = []

        this.setup();
        this.reset();
    }

    setup() {
        const otherPlayers = this.otherPlayers;

        let prChain = Promise.resolve(true);

        otherPlayers.forEach(addr => {
            prChain = prChain.then(() =>
                establishChannel(addr, 'outgoing')
            )
        });

        return prChain;
    }

    reset() {
        this.word = null;
        this.answer = randomWord(this.wordlist);

        while(this.repeatedWord == true) {
            this.answer = randomWord(this.wordlist);
        }

        this.wrongGuesses = [];
        this.guessedLetters = [];
    }

    get round() {
        return this._currentRound;
    }

    restart() {
        this.reset();
    }

    newRound(score=0) {
        const roundData = {
            guess: this.word,
            word: this.answer,
            score
        };

        this.rounds.push(roundData);

        if(this._currentRound > 0)
            this.sendRoundData(roundData);

        this.reset();
        this._currentRound++;
    }

    sendRoundData(roundData) {
        const otherPlayers = this.otherPlayers;

        let promiseChain = Promise.resolve();
        if(otherPlayers && otherPlayers.length > 0) {
            otherPlayers.forEach(peerID => {
                promiseChain = promiseChain.then(() =>
                    sendHoprMessage(peerID, JSON.stringify(roundData))); });
        }

        return promiseChain;
    }

    get score() {
        return this._score;
    }
    set score(val) {
        this._score = val;
    }

    get answer() {
        return this._answer;
    }
    set answer(val) {
        if(this.pastAnswers.includes(val)) {
            this.repeatedWord = true;
        } else {
            this.repeatedWord = false;
            this.pastAnswers.push(val);
        }

        this._answer = val;
        this.word = null;
    }

    // Returns word with "unguessed" letters as underscores
    get word() {
        if(this._word)
            return this._word;

        let _word = '';

        for(let i = 0; i < this._answer.length; i++) {
            _word += '_';
        }

        return _word;
    }

    set word(val) {
        this._word = val;

        if(val === this.answer) {
            let score = MAX_SCORE;

            if(this.incorrectGuesses > 3)
                score = score - (this.incorrectGuesses - 3);

            this.score += score;
            this.newRound(score);
        }
    }

    get incorrectGuesses() {
        return this._incorrectGuesses;
    }
    set incorrectGuesses(val) {
        this._incorrectGuesses = val;
        if(val == 8)
            this.newRound();
    }

    guessLetter(letter) {
        const answer = this.answer;
        let isCorrect = false;

        let word = "";

        for(let i=0; i<this.answer.length; i++) {
            const currentLetter = this.word[i];

            // ie, if letter has already been guessed
            if(currentLetter && currentLetter != '_') {
                word += currentLetter
                // isCorrect = null;
                // break;
            }
            else {
                if(letter == answer[i]) {
                    word += letter;
                    isCorrect = true;
                } else {
                    // isCorrect =  false;
                    word += '_';
                }
            }
        }

        this.word = word;
        if(isCorrect === false)
            this.incorrectGuesses++

        return isCorrect;
    }
}

export default Game;
