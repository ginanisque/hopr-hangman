import Multiplayer from '../../src/game/multiplayer.js';

describe("Multiplayer", function() {
    it('If otherPlayers == null, do not carry out any actions');

    it('If otherPlayers == [], do not carry out any actions');

    it('Start(): Open message socket');

    it('CreateGame: should open channels to all other players');

    it('CreateGame: If channels to other players are already open, gracefully end function');

    it('Connect: Connect to existing game: Call establish channel to game creator', function() {
        console.log("socket:", process.env.NODE_WS_SOCKET2);
    });
});
