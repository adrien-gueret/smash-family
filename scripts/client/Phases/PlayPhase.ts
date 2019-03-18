import { OnlinePhase, dom } from 'ludumjs/client';
import { socketEvent } from 'ludumjs/common';

import SmashFamilyGame from '../SmashFamilyGame';

export default class PlayPhase extends OnlinePhase {
    game: SmashFamilyGame;
    static id = 'PlayPhase';

    hasPlayed: boolean = false;

    onStart() {
        this.hasPlayed = false;
    }

    onAction({ action, target }) {
        if (this.hasPlayed || action !== 'play-card') {
            return;
        }

        this.hasPlayed = true;

        this.game.getSocket().emit('play', dom.getElementIndex(target));
    }

    @socketEvent
    async play(socket, { cardId, cardIndex }) {
        await this.game.playCard(cardId, cardIndex);
        this.game.emitReady();
    }
}