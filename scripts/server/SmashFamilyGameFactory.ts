import { socketEvent } from 'ludumjs/common';
import { GameFactory, GameAlreadyFullError, GameNotFoundError } from 'ludumjs/server';

import * as socketio from 'socket.io';

import SmashFamilyGame from './SmashFamilyGame';

import NewGamePhase from './Phases/NewGamePhase';
import DrawPhase from './Phases/DrawPhase';
import WaitingPlayersPhase from './Phases/WaitingPlayersPhase';
import NewTurnPhase from './Phases/NewTurnPhase';
import PlayPhase from './Phases/PlayPhase';
import EndRoundPhase from './Phases/EndRoundPhase';
import NewRoundPhase from './Phases/NewRoundPhase';

class SmashFamilyGameFactory extends GameFactory {
    games: Array<SmashFamilyGame>;

    constructor() {
        super(SmashFamilyGame);
    }

    @socketEvent
    createGame(socket: socketio.Socket, playerName: string) {
        const game = <SmashFamilyGame>this.create(socket, { name: playerName });
        game.registerPhases([
            WaitingPlayersPhase, NewGamePhase, DrawPhase, NewTurnPhase, PlayPhase,
            EndRoundPhase, NewRoundPhase,
        ]);
        game.start();
    }

    @socketEvent
    joinGame(socket: socketio.Socket, { gameId, playerName }: { gameId: string, playerName: string }) {
        try {
            <SmashFamilyGame> this.join(socket, gameId, { name: playerName });
        } catch(error) {
            if (error instanceof GameNotFoundError) {
                socket.emit('joinGameError', `Game "${gameId}" is not found. Did you make a typo?`);
            } else if (error instanceof GameAlreadyFullError) {
                socket.emit('joinGameError', `Game "${gameId}" has already started and cannot have more players.`);
            }
            else {
                socket.emit('joinGameError', `Error when trying to join game "${gameId}". ${error.toString()}.`);
            }
        }
    }

    @socketEvent
    disconnect(disconnectedSocket: socketio.Socket) {
        const correspondingGame = this.games.filter(game => (
            game.getSockets().some(socket => socket.id === disconnectedSocket.id)
        ))[0];

        if (!correspondingGame) {
            return;
        }


        // correspondingGame.end();

        // TODO: let's wait few seconds/minutes before ending the game
        // const player = correspondingGame.getPlayerFromSocket(disconnectedSocket);
        // correspondingGame.emitToAllPlayersExceptOne(player, 'player_disconnect', player.uniqId);
        // This assumes that a reconnection to the game is possible, where all troubles will begin...
    }
}

export default SmashFamilyGameFactory;