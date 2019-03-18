import 'ludumjs/ludumjs.css';

import NewGamePhase from './Phases/NewGamePhase';
import NewTurnPhase from './Phases/NewTurnPhase';
import TitlePhase from './Phases/TitlePhase';
import DrawPhase from './Phases/DrawPhase';
import JoinGamePhase from './Phases/JoinGamePhase';
import WaitingPlayersPhase from './Phases/WaitingPlayersPhase';
import PlayPhase from './Phases/PlayPhase';
import EndRoundPhase from './Phases/EndRoundPhase';
import WaitBetweenRoundsPhase from './Phases/WaitBetweenRoundsPhase';
import NewRoundPhase from './Phases/NewRoundPhase';
import EndGamePhase from './Phases/EndGamePhase';

import SmashFamilyGame from './SmashFamilyGame';

import '../../style/index.css';
import '../../style/cards.css';
import '../../style/responsive.css';

declare const process : {
    env: {
        SERVER_PORT?: number,
        SERVER_URL?: string,
    }
}

const game = new SmashFamilyGame(document.getElementById('game'));

game.registerPhases([
    TitlePhase, NewGamePhase, DrawPhase, JoinGamePhase, WaitingPlayersPhase,
    NewTurnPhase, PlayPhase, EndRoundPhase, WaitBetweenRoundsPhase, NewRoundPhase,
    EndGamePhase,
]);

game.connect(process.env.SERVER_PORT, process.env.SERVER_URL);

Object.defineProperty(window, 'game', { value: game });