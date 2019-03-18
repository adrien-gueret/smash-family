import { OnlinePhase } from 'ludumjs/client';

import SmashFamilyGame from '../SmashFamilyGame';

export default class WaitingPlayersPhase extends OnlinePhase {
    game: SmashFamilyGame;
    static id = 'WaitingPlayersPhase';

    onStart() {
        document.getElementById('game-server-id').appendChild(
            document.createTextNode(this.game.gameUniqId)
        );
      
        this.game.emitReady();
    }
}