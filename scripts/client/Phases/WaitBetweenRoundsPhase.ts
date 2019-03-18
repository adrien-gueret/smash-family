import { Phase } from 'ludumjs/client';

import SmashFamilyGame from '../SmashFamilyGame';

export default class WaitBetweenRoundsPhase extends Phase {
    game: SmashFamilyGame;
    static id = 'WaitBetweenRoundsPhase';

    onStart() {
        [].slice.call(document.getElementById('board').querySelectorAll('.deck')).forEach((deck) => {
            deck.parentNode.removeChild(deck);
        });

        this.game.reset();
    }
}