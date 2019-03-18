import { OnlinePhase } from 'ludumjs/client';
import { socketEvent } from 'ludumjs/common';
import camelCase from 'camelcase';
import { uniqueNamesGenerator } from 'unique-names-generator';

import SmashFamilyGame from '../SmashFamilyGame';

export default class TitlePhase extends OnlinePhase {
    game: SmashFamilyGame;
    static id = 'TitlePhase';
    
    private input: HTMLInputElement;

    onStart(userName?: string) {
        this.input = document.getElementById('username') as HTMLInputElement;
        
        this.input.value = userName || camelCase(uniqueNamesGenerator('_', true), { pascalCase: true })

        window.setTimeout(() => {
            this.input.focus();
            this.input.select();
        }, 0);
    }

    onAction({ action }) {
        switch(action) {
            case 'create':
                this.game.getSocket().emit('createGame', this.input.value);
            return;

            case 'join':
                this.game.goToPhaseById('JoinGamePhase', this.input.value);
            return;

            case 'rules':
                window.open('https://github.com/adrien-gueret/smash-family');
            return;
        }
    }

    @socketEvent
    ludumjs_gameJoined() {
        this.game.goToPhaseById('WaitingPlayersPhase');
    }
}