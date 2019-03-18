import { Phase } from 'ludumjs/client';

import SmashFamilyGame from '../SmashFamilyGame';

export default class NewGamePhase extends Phase {
    game: SmashFamilyGame;
    static id = 'NewGamePhase';

    onStart(totalCards: number) {
        this.game.initDeck(totalCards);

        document.getElementById('game-server-id').appendChild(
            document.createTextNode(this.game.gameUniqId)
        );

        this.game.emitReady();
    }
}