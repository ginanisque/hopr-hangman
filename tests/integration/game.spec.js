import { expect } from 'chai';
import Game from '../../src/game/game';
import sowpodslist from '../../src/wordlists/sowpods.js';

import "../config.js";

describe('Game', function() {
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

    it('After 8 wrong guesses, start new round', function() {
        const game = new Game();
        game.answer = 'foobar';

        ['a', 'b', 'e', 'f', 'g', 'z', 'i', 'k', 'p', 'q']
            .forEach(letter => {
                game.guessLetter(letter)
                expect(game.round).to.equal(1);
            });

        game.guessLetter('m');
        expect(game.round).to.equal(2);
    });

    it('View previous round words and guesses', function() {
        const game = new Game();
        game.answer = 'foobar';

        game.guessLetter('i');

        'foobar'.split("").forEach(letter =>
            game.guessLetter(letter));

        expect(game.rounds).to.have.deep.members([
            {
                word: 'foobar',
                guess: 'foobar',
                score: 5
            }
        ]);

        game.answer = 'chocolate';

        "chocmingpqrl".split("").forEach(letter =>
            game.guessLetter(letter));

        expect(game.rounds).to.include.deep.members([
            {
                word: 'chocolate',
                guess: 'choco____',
                score: 0
            }
        ]);
    });
});
