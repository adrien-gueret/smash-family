import { Phase } from 'ludumjs/client';

import SmashFamilyGame from '../SmashFamilyGame';

export default class EndGamePhase extends Phase {
    game: SmashFamilyGame;
    static id = 'EndGamePhase';

    getDialogMessage(winner: { uniqId: string } = null): string {
        if (!winner) {
            return 'Draw';
        }

        if (winner.uniqId === this.game.playerUniqId) {
            return 'Victory!';
        }

        return 'Defeat...';
    }

    onStart(winner) {
        this.game.getSocket().disconnect(true);

        const message = this.getDialogMessage(winner);

        document.getElementById('end-game-message').innerHTML = message;
        this.game.showDialog('end-game');
    }
}