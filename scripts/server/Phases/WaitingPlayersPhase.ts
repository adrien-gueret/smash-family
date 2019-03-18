import { arrays, socketEvent } from 'ludumjs/common';
import { Phase } from 'ludumjs/server';

import SmashFamilyGame from '../SmashFamilyGame';

export default class WaitingPlayersPhase extends Phase {
    game: SmashFamilyGame;
    static id = 'WaitingPlayersPhase';

    @socketEvent
    ready() {
        if(this.game.isFull()) {
            this.game.goToPhaseById('NewGamePhase');
        }
    }
}