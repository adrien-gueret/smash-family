import { socketEvent } from 'ludumjs/common';
import { Phase } from 'ludumjs/server';

import cardData from '../../common/data/cards';
import SmashFamilyGame from '../SmashFamilyGame';

const TOTAL_OF_EACH_CARD = 3;

export default class NewGamePhase extends Phase {
    game: SmashFamilyGame;
    static id = 'NewGamePhase';

    private playersReady = 0;

    onStart() {
        let cardIds = [];
        this.playersReady = 0;

        for (let i = 0; i < TOTAL_OF_EACH_CARD; i++) {
            cardIds = cardIds.concat(Object.keys(cardData));
        }

        this.game.setDeck(cardIds);

        this.game.emitSwitchPhase('NewGamePhase', this.game.getTotalCards());
    }

    @socketEvent
    ready() {
       this.playersReady++;

       if (this.playersReady >= SmashFamilyGame.MAX_PLAYERS) {
           this.game.goToPhaseById('DrawPhase', 'firstDraw');
       }
    }
}