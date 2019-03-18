import { Phase } from 'ludumjs/client';

import SmashFamilyGame from '../SmashFamilyGame';

export default class NewTurnPhase extends Phase {
    game: SmashFamilyGame;
    static id = 'NewTurnPhase';

    closeDialog() {
        try {
            this.game.hideDialog('new-turn');
        } catch(e) {}
    }

    onStart({ activePlayerId, shouldHideCard } : { activePlayerId: string, shouldHideCard: boolean }) {
        const isThisPlayerTurn = activePlayerId === this.game.playerUniqId;
        let message = isThisPlayerTurn ? 'Your turn!' : "Opponent's turn...";
        let messageTime = 1000;

        if (isThisPlayerTurn && shouldHideCard) {
            message += "<br /><small>Don't forget! The card will be played <strong>face down</strong> this turn.</small>";
            messageTime *= 3;
        }

        document.getElementById('new-turn-message').innerHTML = message;
        this.game.showDialog('new-turn');

        window.setTimeout(() => {
            this.closeDialog();
            this.game.emitReady();
        }, messageTime);
    }

    onAction({ action }) {
        if (action !== 'close') {
            return;
        }

        this.closeDialog();
    }
}