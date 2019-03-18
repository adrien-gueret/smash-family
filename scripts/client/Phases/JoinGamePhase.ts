import { OnlinePhase } from 'ludumjs/client';
import { socketEvent } from 'ludumjs/common';

import SmashFamilyGame from '../SmashFamilyGame';

export default class JoinGamePhase extends OnlinePhase {
    game: SmashFamilyGame;
    static id = 'JoinGamePhase';

    private userName: string;

    onStart(userName) {
        const form = document.getElementById('join-game-form') as HTMLFormElement;
        const input = document.getElementById('game-to-join-id') as HTMLInputElement;

        this.userName = userName;

        form.onsubmit = (e) => {
            e.preventDefault();

            const { activeElement } = document;

            if (activeElement instanceof HTMLInputElement) {
                activeElement.blur();
            }

            this.game.getSocket().emit('joinGame', { gameId: input.value, playerName: this.userName });
        };
    }

    onAction({ action }) {
        switch(action) {
            case 'back': 
                this.game.goToPhaseById('TitlePhase', this.userName);
            break;

            case 'close-error':
                try {
                    this.game.hideDialog('error');
                } catch (e) {
                    //
                }
            break;
            
            default: break;
        }
    }

    @socketEvent
    joinGameError(socket, message) {
        document.getElementById('error-message').innerHTML = message;
        this.game.showDialog('error');
    }

    @socketEvent
    ludumjs_gameJoined() {
        this.game.emitReady();
    }
}