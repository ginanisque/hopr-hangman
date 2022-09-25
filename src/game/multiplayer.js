import { sendHoprMessage, establishChannel } from '../connectivity/hoprNode.js';
import useWebSocket from '../connectivity/useWebSocket.js';

class Multiplayer {
    constructor(otherPlayers) {
        this.otherPlayers = otherPlayers;
    }

    /**
     * Connects to existing game
     */
    connectGame() {
    }

    /**
     * Creates game for others to connect to
     */
    createGame() {
    }

    sendRoundScores() {
    }

    chooseWinner() {
    }
}
