import { socketEvent } from 'ludumjs/common';
import { Phase } from 'ludumjs/server';

import SmashFamilyGame from '../SmashFamilyGame';

export default class NewTurnPhase extends Phase {
    game: SmashFamilyGame;
    static id = 'NewTurnPhase';

    private playersReady = 0;
    private activePlayer;

    onStart(isSamePlayer = false) {
        this.playersReady = 0;

        if (isSamePlayer) {
            this.goToDrawPhase();
            return false;
        }
         
        this.activePlayer = this.game.activeNextPlayer();
        this.game.turnNumber++;

        this.game.emitSwitchPhase('NewTurnPhase', {
            activePlayerId: this.activePlayer.uniqId,
            shouldHideCard: this.game.shouldPlayHiddenCardThisTurn(),
        });
    }

    goToDrawPhase() {
        this.game.goToPhaseById('DrawPhase', this.game.isPlayer1(this.activePlayer) ? 'player1' : 'player2');
    }

    @socketEvent
    ready() {
        this.playersReady++;

        if (this.playersReady < SmashFamilyGame.MAX_PLAYERS) {
            return;
        }

        this.playersReady = 0;

        this.goToDrawPhase();
    }
}