import { OnlinePhase } from 'ludumjs/client';
import { socketEvent } from 'ludumjs/common';

import SmashFamilyGame from '../SmashFamilyGame';

export default class DrawPhase extends OnlinePhase {
    game: SmashFamilyGame;
    static id = 'DrawPhase';

    @socketEvent
    async draw(socket, cardIds) {
        await cardIds.reduce(async (promise, cardId) => {
            await promise;
            return this.game.drawCard(cardId);
        }, async () => {});

        this.game.emitReady();
    }

    @socketEvent
    async boardDraw(socket, cardIds) {
        await cardIds.reduce(async (promise, cardId) => {
            await promise;
            return this.game.boardDraw(cardId);
        }, async () => {});

        this.game.emitReady();
    }
}