import { socketEvent } from 'ludumjs/common';
import { Phase } from 'ludumjs/server';

import SmashFamilyGame from '../SmashFamilyGame';

export default class PlayPhase extends Phase {
    game: SmashFamilyGame;
    static id = 'PlayPhase';

    private playersReady: number = 0;
    private hasGatheredVisibleCards: boolean = false;

    onStart() {
        this.game.emitSwitchPhase('PlayPhase');
        this.hasGatheredVisibleCards = false;
        this.playersReady = 0;
    }

    @socketEvent
    play(socket, cardIndex) {
        const player = this.game.getPlayerFromSocket(socket);
    
        if (!this.game.isPlayerActive(player)) {
            return;
        }

        const playerPlay = this.game.isPlayer1(player) ? 'player1Play' : 'player2Play';
        const shouldHideCard = this.game.shouldPlayHiddenCardThisTurn();

        const cardId = this.game[playerPlay](cardIndex, shouldHideCard);

        this.hasGatheredVisibleCards = !shouldHideCard && this.game.getVisibleCardsNumber(cardId) > 1;

        const eventData = {
            cardId,
            cardIndex,
        }

        this.game.emitToAllPlayersExceptOne(player, 'play', eventData);
        socket.emit('play', eventData);
    }

    @socketEvent
    ready() {
        this.playersReady++;

        if (this.playersReady < SmashFamilyGame.MAX_PLAYERS) {
            return;
        }

        this.playersReady = 0;

        if (!this.hasGatheredVisibleCards && this.game.turnNumber >= SmashFamilyGame.MAX_TURNS) {
            this.game.goToPhaseById('EndRoundPhase');
        } else {
            this.game.goToPhaseById('NewTurnPhase', this.hasGatheredVisibleCards);
        }
    }
}