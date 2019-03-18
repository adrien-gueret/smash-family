import { dom, OnlineGame } from 'ludumjs/client';
import { socketEvent } from 'ludumjs/common';

import Card from './components/Card';

export default class SmashFamilyGame extends OnlineGame {
    deckCards: Array<Card>;
    playerCards: Array<Card>;
    opponentCards: Array<Card>;
    boardCards: Array<Card>;
    deckContainer: HTMLElement;
    playerHandContainer: HTMLElement;
    opponentHandContainer: HTMLElement;
    boardContainer: HTMLElement;
    playerName: string;
    opponentName: string;

    constructor(domContainer) {
        super(domContainer);

        this.deckCards = [];
        this.playerCards = [];
        this.opponentCards = [];
        this.boardCards = [];

        this.deckContainer = document.getElementById('deck');
        this.playerHandContainer = document.getElementById('hand-player');
        this.opponentHandContainer = document.getElementById('hand-opponent');
        this.boardContainer = document.getElementById('board');
    }

    getAllPlayedCards(): Array<Card> {
        return [
            ...this.playerCards,
            ...this.opponentCards,
            ...this.boardCards,
        ];
    }

    reset() {
        this.deckCards = [];
        this.playerCards = [];
        this.opponentCards = [];
        this.boardCards = [];
    }

    initDeck(totalCards: number) {
        this.deckContainer.innerHTML = '';

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < totalCards; i++) {
            const card = new Card();
            card.domElement.style.setProperty('--index', `-${i}px`);
            fragment.appendChild(card.domElement);

            this.deckCards.push(card);
        }

        this.deckContainer.appendChild(fragment);
    }

    emitReady() {
        window.requestAnimationFrame(() => this.getSocket().emit('ready'));
    }

    drawCard(id: string = null): Promise<void> {
        const card = this.deckCards.pop();

        if (!card) {
            return;
        }

        const isOpponent = !id;

        if (isOpponent) {
            this.opponentCards.push(card);
        } else {
            card.domElement.setAttribute('data-action', 'play-card');
            this.playerCards.push(card);
            card.setCardId(id);
        }

        const handContainer = isOpponent ? this.opponentHandContainer : this.playerHandContainer;

        return new Promise((resolve) => {
            window.setTimeout(async () => {
                await dom.appendChildWithTransition(card.domElement, handContainer, 350);
                resolve();
            }, id ? 450 : 0);
        });
    }

    boardDraw(id: string = null): Promise<void> {
        const card = this.deckCards.pop();

        if (!card) {
            return;
        }

        this.boardCards.push(card);
        card.setCardId(id);

        return new Promise((resolve) => {
            window.setTimeout(async () => {
                await this.moveToBoard(card);
                resolve();
            }, id ? 450 : 0);
        });
    }

    async moveToBoard(card: Card): Promise<void> {
        let cardContainer = <HTMLDivElement>this.boardContainer.querySelector(`[data-card-id="${card.id}"]`);

        if (!cardContainer) {
            cardContainer = <HTMLDivElement>document.createElement('div');
            cardContainer.setAttribute('data-card-id', card.id);
            cardContainer.className = 'deck';
            this.boardContainer.appendChild(cardContainer);
        }

        const totalCards = cardContainer.querySelectorAll('.card').length;
        card.domElement.style.setProperty('--index', `${totalCards}px`);

        await dom.appendChildWithTransition(card.domElement, cardContainer, 350);
    }

    playCard(cardId: string, cardIndex: number): Promise<void> {
        const cards = this.isPlayerActive ? this.playerCards : this.opponentCards;
        const card = cards[cardIndex];

        cards.splice(cardIndex, 1);

        this.boardCards.push(card);

        card.setCardId(cardId);

        const shouldCardFlip = !this.isPlayerActive && cardId || this.isPlayerActive && !cardId;

        return new Promise((resolve) => {
            window.setTimeout(async () => {
                await this.moveToBoard(card);
                resolve();
            }, shouldCardFlip ? 450 : 0);
        });
    }

    @socketEvent
    connection() {
        this.start();
    }

    @socketEvent
    connect_error() {
        console.error('Can\'t connect to server.');
    }

    @socketEvent
    ludumjs_gameFull(socket, players) {
        const playerIndex = players.findIndex(p => p.uniqId === this.playerUniqId);
        const opponentIndex = 1 - playerIndex;

        const player = players[playerIndex];
        const opponent = players[opponentIndex];

        this.domContainer.style.setProperty('--opponent-name', `"${opponent.name}"`);
        this.domContainer.style.setProperty('--player-name', `"${player.name}"`);
    }
}
