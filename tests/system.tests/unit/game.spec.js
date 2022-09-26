import { expect } from 'chai';
import Game from '../../../src/game/game';
import sowpodslist from '../../../src/wordlists/sowpods.js';
import sinon from 'sinon';

describe('Game', function() {
    it('Game wordlist should be sowpods 5-words and over', function() {
        const game = new Game();
        expect(game.answer).to.be.oneOf(sowpodslist);
    });

    it.skip('Game should not repeat any words', function() {
        this.timeout(30);
        const pastAnswers = [];

        const game = new Game();

        for(let i=0; i < sowpodslist.length - 1; i++) {
            const answer = game.answer;

            expect(answer).to.be.not.oneOf(pastAnswers);
            pastAnswers.push(answer);
            game.restart();
        }
    });

    it('game.word should return empty str with length equal to answer', function() {
        const game = new Game();
        game.answer = 'foobar';
        expect(game.word).to.lengthOf(6);
    });

    it('word should only have underscores', function() {
        const game = new Game();
        game.answer = 'fulchion';

        expect(game.word).to.equal('________');
    });

    it('When letter is guessed correctly, replace underscores in word with letter', function() {
        let game = new Game();

        game.answer = 'foobar';
        game.guessLetter('o');
        expect(game.word).to.equal('_oo___');
        game.guessLetter('f');
        expect(game.word).to.equal('foo___');

        game = new Game();
        game.answer = 'icecream';
        game.guessLetter('e');
        expect(game.word).to.equal('__e__e__');
        game.guessLetter('c');
        expect(game.word).to.equal('_cec_e__');
        game.guessLetter('i');
        expect(game.word).to.equal('icec_e__');
        game.guessLetter('a');
        expect(game.word).to.equal('icec_ea_');
        game.guessLetter('r');
        expect(game.word).to.equal('icecrea_');
    });

    it('when letter is guessed correctly, return true', function() {
        const game = new Game();

        game.answer = 'foobar';
        expect(game.guessLetter('o')).to.be.true;
        expect(game.guessLetter('f')).to.be.true;

        game.answer = 'icecream';
        expect(game.guessLetter('e')).to.be.true;
    });

    it('When incorrect letter is guessed, return false', function() {
        const game = new Game();

        game.answer = 'foobar';
        expect(game.guessLetter('n')).to.be.false;
        expect(game.guessLetter('q')).to.be.false;

        game.answer = 'icecream';
        expect(game.guessLetter('o')).to.be.false;
    });

    it('When incorrect letter is guessed, add letter to game.incorrectGuesses', function() {
        let game = new Game();

        game.answer = 'foobar';
        game.guessLetter('n');
        game.guessLetter('q');

        expect(game.wrongGuesses).to.have.members(['n', 'q']);

        game = new Game();
        game.answer = 'icecream';
        game.guessLetter('o');
        expect(game.wrongGuesses).to.have.members(['o']);
    });

    it('When correct letter is guessed, add letter to game.correctGuesses', function() {
        let game = new Game();
        game.answer = 'foobar';
        game.guessLetter('o');
        game.guessLetter('f');
        game.guessLetter('b');

        expect(game.correctGuesses).to.have.members(['o', 'f', 'b']);


        game = new Game();
        game.answer = 'icecream';
        game.guessLetter('i');
        game.guessLetter('r');
        game.guessLetter('e');
        expect(game.correctGuesses).to.have.members(['i', 'r', 'e']);
    });

    it('When adding letters to guesses, do not mix correct and incorrect guesses', function() {
        let game = new Game();
        game.answer = 'foobar';

        game.guessLetter('n');
        game.guessLetter('q');

        game.guessLetter('o');
        game.guessLetter('f');
        game.guessLetter('b');

        expect(game.correctGuesses).to.have.members(['o', 'f', 'b']);
        expect(game.wrongGuesses).to.have.members(['n', 'q']);


        game = new Game();
        game.answer = 'icecream';

        game.guessLetter('o');

        game.guessLetter('i');
        game.guessLetter('r');
        game.guessLetter('e');

        expect(game.wrongGuesses).to.have.members(['o']);
        expect(game.correctGuesses).to.have.members(['i', 'r', 'e']);
    });

    it('new game defaults', function() {
        const game = new Game();
        expect(game.incorrectGuesses, 'incorrect guesses should be 0').to.equal(0);
        expect(game.rounds, 'rounds should be empty array').to.be.an('array').that.is.empty;
    });

    it('When correct letter is guessed, do not increment incorrectGuesses', function() {
        let game = new Game();

        game.answer = 'foobar';
        game.guessLetter('o');
        expect(game.incorrectGuesses).to.equal(0);
        game.guessLetter('b');
        expect(game.incorrectGuesses).to.equal(0);

        game = new Game();
        game.answer = 'icecream';
        game.guessLetter('i');
        expect(game.incorrectGuesses).to.equal(0);
        game.guessLetter('m');
        expect(game.incorrectGuesses).to.equal(0);
    });

    it('When incorrect letter is guessed, increment incorrectGuesses', function() {
        let game = new Game();
        game.answer = 'foobar';
        expect(game.guessLetter('n')).to.be.false;
        expect(game.incorrectGuesses).to.equal(1);
        expect(game.guessLetter('q')).to.be.false;
        expect(game.incorrectGuesses).to.equal(2);

        game = new Game();
        game.answer = 'icecream';
        expect(game.guessLetter('o')).to.be.false;
        expect(game.incorrectGuesses).to.equal(1);
    });

    it('New game object config', function() {
        const game = new Game();
        expect(game.round).to.equal(1);
        expect(game.score).to.equal(0);
    });

    it('If word == answer, call newRound', function() {
        let game = new Game();
        const spy = sinon.spy(game, 'newRound');

        game.answer = 'foobar';

        game.word = 'fooba_';

        sinon.assert.notCalled(spy);
        game.word = 'foobar';
        sinon.assert.calledOnce(spy);
    });

    describe('Setting score: If word == answer', function() {
        it('if wrong guesses <= 3, set score = 5', function() {
            let game = new Game();
            game.answer = 'foobar';

            game.word = 'fooba_';
            expect(game.score).to.equal(0);
            game.word = 'foobar';
            expect(game.score).to.equal(5);
        })
        it('if wrong guesses > 3, set score', function() {
            let game = new Game();
            game.answer = 'foobar';
            game.incorrectGuesses = 4;
            game.word = 'foobar';
            expect(game.score).to.equal(4);

            game = new Game();
            game.answer = 'icecream';
            game.incorrectGuesses = 5;
            game.word = 'icecream';
            expect(game.score).to.equal(3);
        })

        it('Set score to equal score from previous round + current round score', function() {
            let game = new Game();
            game.score = 3;

            game.answer = 'icecream';
            game.incorrectGuesses = 4;
            game.word = 'icecream';
            expect(game.score).to.equal(7);
        })
    });

    describe('NewRound()', function() {
        it('newRound should increase round number by one', function() {
            const game = new Game();
            expect(game.round).to.equal(1);

            game.newRound();
            expect(game.round).to.equal(2);

            game.newRound();
            expect(game.round).to.equal(3);

            game.newRound();
            game.newRound();
            expect(game.round).to.equal(5);
        });
        it('newRound: After 5 rounds, call multiplayer.gameOver', function() {
            const game = new Game();
            const spy = sinon.stub(game.multiplayer, 'sendGameOver').resolves(true);

            game.onGameOver(function() {
                sinon.assert.calledWith(spy, sinon.match.has('gameScore'));
                done();
            });
            expect(game.round).to.equal(1);

            game.newRound();
            expect(game.round).to.equal(2);

            game.newRound();
            expect(game.round).to.equal(3);

            game.newRound();
            game.newRound();
            sinon.assert.notCalled(spy);
            expect(game.round).to.equal(5);
        });

        it('newRound should reset goodKeys and badKeys arrays', function() {
            const game = new Game();
            game.newRound();
        });
    });

    it('If incorrectGuesses = 8, start new round (newRound())', function() {
        const game = new Game();
        const spy = sinon.spy(game, 'newRound');

        game.incorrectGuesses = 8;

        sinon.assert.calledOnce(spy);
    });

    it('When newRound() is called, add word and answer to round histories', function() {
        const game = new Game();

        game.answer = 'foobar';
        game.word = 'foo__r';
        game.newRound();

        expect(game.rounds).to.have.lengthOf(1);
        expect(game.rounds[0]).to.include({
            word: 'foobar',
            guess: 'foo__r',
        });

        game.answer = 'colder';
        game.word = '_o__er';
        game.newRound();
        expect(game.rounds).to.have.lengthOf(2);
        expect(game.rounds[1]).to.include({
            word: 'colder',
            guess: '_o__er',
        });
    });
    it('When guessing letters, add letter to guessedLetters' );

    it('After every round, call sendRoundData() to send round data to to other players', function(done) {
        this.timeout(5000);
        const game = new Game();

        const spy = sinon.stub(game, 'sendRoundData').resolves(true);
        game.onRoundOver(function() {
            sinon.assert.calledOnce(spy);
            done();
        });

        game.answer = 'foobar';
        game.word = 'foo__r';
        sinon.assert.notCalled(spy);

        return game.newRound();
    });
});
