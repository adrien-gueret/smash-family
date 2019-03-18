import { socketEvent } from 'ludumjs/common';
import { Phase } from 'ludumjs/server';

import { Family } from '../../common/services/family';
import SmashFamilyGame from '../SmashFamilyGame';

function mergeArrays(flattedArray, arrays) {
    return [...flattedArray, ...arrays];
}

export default class NewRoundPhase extends Phase {
    game: SmashFamilyGame;
    static id = 'NewRoundPhase';

    private playersReady = 0;

    onStart({ player1Families, player2Families }: {  player1Families: Array<Family>, player2Families: Array<Family> }) {
        const player1Cards = player1Families.map(family => family.cardIds);
        const player2Cards = player2Families.map(family => family.cardIds);
        const cardIdsToRemove = [...player1Cards, ...player2Cards].reduce(mergeArrays, []);

        this.game.reset(cardIdsToRemove);
        this.game.emitSwitchPhase('NewRoundPhase', this.game.getTotalCards());
    }

    @socketEvent
    ready() {
        this.playersReady++;

        if (this.playersReady >= SmashFamilyGame.MAX_PLAYERS) {
            this.playersReady = 0;
            this.game.goToPhaseById('DrawPhase', 'firstDraw');
        }
    }
}