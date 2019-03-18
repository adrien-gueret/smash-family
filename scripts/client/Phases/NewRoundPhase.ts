import { OnlinePhase } from 'ludumjs/client';
import { socketEvent } from 'ludumjs/common';

import SmashFamilyGame from '../SmashFamilyGame';

export default class NewRoundPhase extends OnlinePhase {
    game: SmashFamilyGame;
    static id = 'NewRoundPhase';

    onStart(totalCards: number) {
        this.game.initDeck(totalCards);
        this.game.emitReady();
    }
}