import * as SocketIO from 'socket.io';

import { socketEvent } from 'ludumjs/common';
import { Phase, Player } from 'ludumjs/server';

import { getCompleteFamilies, Family } from '../../common/services/family';
import SmashFamilyGame from '../SmashFamilyGame';

export default class EndRoundPhase extends Phase {
    game: SmashFamilyGame;
    static id = 'EndRoundPhase';

    private playersReady: number = 0;
    private step: string;
    private player1: Player;
    private player2: Player;
    private player1Families: Array<Family>;
    private player2Families: Array<Family>;
    private commonFamilies: Array<Family>;

    onStart() {
        this.step = 'start';
        this.playersReady = 0;
        const [player1, player2] = this.game.getPlayers();

        this.player1 = player1;
        this.player2 = player2;
        this.game.emitSwitchPhase('EndRoundPhase', this.game.getHiddenCardIds());
    }

    revealHands() {
        this.step = 'revealHands';

        this.player1.socket.emit('revealOpponentHand', this.game.getPlayer2Hand());
        this.player2.socket.emit('revealOpponentHand', this.game.getPlayer1Hand());
    }

    checkFamilies() {
        this.step = 'checkFamilies';

        const board = this.game.getBoard();

        const player1Families = getCompleteFamilies([
            ...this.game.getPlayer1Hand(),
            ...board,
        ]);

        const player2Families = getCompleteFamilies([
            ...this.game.getPlayer2Hand(),
            ...board,
        ]);

        this.player1Families = player1Families.filter(family => (
            player2Families.every(player2Family => player2Family.serie !== family.serie)
        ));

        this.player2Families = player2Families.filter(family => (
            player1Families.every(player1Family => player1Family.serie !== family.serie)
        ));

        this.commonFamilies = player1Families.filter(family => (
            player2Families.some(player2Family => player2Family.serie === family.serie)
        ));

        const { player1Score, player2Score } = this.game.updateScores(this.player1Families, this.player2Families);

        this.player1.socket.emit('checkFamilies', {
            player: this.player1Families,
            opponent: this.player2Families,
            common: this.commonFamilies,
            newPlayerScore: player1Score,
            newOpponentScore: player2Score,
        });
        
        this.player2.socket.emit('checkFamilies', {
            player: this.player2Families,
            opponent: this.player1Families,
            common: this.commonFamilies,
            newPlayerScore: player2Score,
            newOpponentScore: player1Score,
        });
    }

    checkEndRound(socket: SocketIO.Socket, areAllPlayersReady: boolean) {
        const winner = this.game.getWinner();

        if (winner === false) {
            if (areAllPlayersReady) {
                const { player1Families, player2Families } = this;
                this.game.goToPhaseById('NewRoundPhase', { player1Families, player2Families });
            }

            return;
        }

        socket.emit('ludumjs_switchPhase', { phaseName: 'EndGamePhase', data: winner ? winner.serialize() : winner });

        if (areAllPlayersReady) {
            this.game.end();
        }
    }

    @socketEvent
    ready(socket) {
        this.playersReady++;

        const areAllPlayersReady = this.playersReady >= SmashFamilyGame.MAX_PLAYERS;

        if (this.step === 'checkFamilies') {
            this.checkEndRound(socket, areAllPlayersReady);
            return;
        }

        if (!areAllPlayersReady) {
            return;
        }

        this.playersReady = 0;

        switch(this.step) {
            case 'start':
                this.revealHands();
            break;

            case 'revealHands':
                this.checkFamilies();
            break;

            default: break;
        }
    }
}