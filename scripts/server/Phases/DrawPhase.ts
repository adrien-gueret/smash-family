import { socketEvent } from 'ludumjs/common';
import { Phase } from 'ludumjs/server';

import SmashFamilyGame from '../SmashFamilyGame';

export default class DrawPhase extends Phase {
    game: SmashFamilyGame;
    static id = 'DrawPhase';

    private playersReady = 0;
    private drawType = '';

    firstBoardDraw() {
        this.drawType = 'firstBoardDraw';

        const hiddenCards = [
            this.game.boardDraw(true),
        ];

        const visibleCards = [
            this.game.boardDraw(),
            this.game.boardDraw(),
        ];

        while (visibleCards.every(cardId => cardId === visibleCards[0])) {
            visibleCards.push(this.game.boardDraw());
        }

        this.game.emitToAllPlayers('boardDraw', [
            ...hiddenCards,
            ...visibleCards,
        ]);
    }

    firstDraw() {
        const player1Cards = [
            this.game.player1Draw(),
            null,
            this.game.player1Draw(),
            null,
            this.game.player1Draw(),
            null,
            this.game.player1Draw(),
            null,
        ];

        const player2Cards = [
            this.game.player2Draw(),
            null,
            this.game.player2Draw(),
            null,
            this.game.player2Draw(),
            null,
            this.game.player2Draw(),
            null,
        ];

        const players = this.game.getPlayers();

        players[0].socket.emit('draw', player1Cards);
        players[1].socket.emit('draw', player2Cards);
    }

    player1Draw() {
        const card = this.game.player1Draw();
        const players = this.game.getPlayers();

        players[0].socket.emit('draw', [card]);
        players[1].socket.emit('draw', [null]);
    }

    player2Draw() {
        const card = this.game.player2Draw();
        const players = this.game.getPlayers();

        players[0].socket.emit('draw', [null]);
        players[1].socket.emit('draw', [card]);
    }

    onStart(type) {
        this.drawType = type;

        this.game.emitSwitchPhase('DrawPhase');

        switch (type) {
            case 'firstDraw':
                this.firstDraw();
            break;

            case 'player1':
                this.player1Draw();
            break;

            case 'player2':
                this.player2Draw();
            break;

            default: break;
        }
    }

    @socketEvent
    ready()  {
        this.playersReady++;

        if (this.playersReady < SmashFamilyGame.MAX_PLAYERS) {
            return;
        }

        this.playersReady = 0;
        
        switch (this.drawType) {
            case 'firstDraw':
                this.firstBoardDraw();
            break;

            case 'firstBoardDraw':
                this.game.goToPhaseById('NewTurnPhase');
            break;

            default:
                this.drawType = '';
                this.game.goToPhaseById('PlayPhase');
            break;
        }
    }
}