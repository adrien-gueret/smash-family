import { OnlinePhase, dom } from 'ludumjs/client';
import { socketEvent } from 'ludumjs/common';

import cardData from '../../common/data/cards';
import { Family } from '../../common/services/family';

import Card from '../components/Card';
import SmashFamilyGame from '../SmashFamilyGame';

const isHidden = card => !card.id;

function getFamilyContainerReducer(container: HTMLElement) {
    return (familyContainers: HTMLElement, family: Family) => {
        const familyContainer = document.createElement('div');
        familyContainer.className = 'deck';

        container.appendChild(familyContainer);

        return {
            ...familyContainers,
            [family.serie]: familyContainer,
        };
    };    
}

export default class EndRoundPhase extends OnlinePhase {
    game: SmashFamilyGame;
    static id = 'EndRoundPhase';

    private playerFamiliesContainer: HTMLElement;
    private opponentFamiliesContainer: HTMLElement;
    private commonFamiliesContainer: HTMLElement;
    private playerHandContainer: HTMLElement;
    private opponentHandContainer: HTMLElement;
    private tableScoreContainer: HTMLElement;

    private isReadyToHideScores: boolean;
    private cardsNotInCompleteFamily: Array<Card>;

    onStart(hiddenCardIds) {
        this.revealCards(hiddenCardIds);
        this.playerFamiliesContainer = document.getElementById('playerFamilies');
        this.opponentFamiliesContainer = document.getElementById('opponnetFamilies');
        this.commonFamiliesContainer = document.getElementById('commonFamilies');
        this.playerHandContainer = document.getElementById('hand-player');
        this.opponentHandContainer = document.getElementById('hand-opponent');
        this.tableScoreContainer = document.getElementById('table-score');

        this.isReadyToHideScores = false;
        this.cardsNotInCompleteFamily = [];

        this.playerFamiliesContainer.innerHTML = '';
        this.opponentFamiliesContainer.innerHTML = '';
        this.commonFamiliesContainer.innerHTML = '';
    }

    onAction({ action }) {
        if(!this.isReadyToHideScores || action !== 'hide-scores') {
            return;
        }

        this.isReadyToHideScores = false;

        this.tableScoreContainer.classList.add('hidden');

        const dialogContainer = this.game.getDialog('families').parentNode as HTMLElement;
        dialogContainer.style.setProperty('background', 'transparent');

        this.game.getAllPlayedCards().forEach(card => card.turnFaceDown());

        window.requestAnimationFrame(() => {
            const decksToMove = [
                ...[].slice.call(this.playerFamiliesContainer.querySelectorAll('.deck')),
                ...[].slice.call(this.opponentFamiliesContainer.querySelectorAll('.deck')),
            ];

            const cardsToPutBackInDeck = [
                ...this.cardsNotInCompleteFamily.map(card => card.domElement),
                ...[].slice.call(this.commonFamiliesContainer.querySelectorAll('.card')),
            ];
            
            decksToMove.forEach(deck => deck.classList.add('moving'));

            const lastDeckCardContainer = this.game.deckContainer.lastElementChild as HTMLElement;
            
            let lastIndex = lastDeckCardContainer ? parseInt(lastDeckCardContainer.style.getPropertyValue('--index'), 10) : 0;
            cardsToPutBackInDeck.forEach((domElement) => {
                lastIndex--
                domElement.style.setProperty('--index', `${lastIndex}px`);
                dom.appendChildWithTransition(domElement, this.game.deckContainer);
            });
            
            window.setTimeout(() => {
                decksToMove.forEach(deck => deck.parentNode.removeChild(deck));
                this.game.hideDialog('families');

                this.game.goToPhaseById('WaitBetweenRoundsPhase');
                
                this.game.emitReady();
            }, 500);
        });
    }

    getMovedCardToResultsContainer(seriesToContainers, playerFamilies: Array<Family>, opponnetFamilies: Array<Family>) {
        const playerSeries = playerFamilies.map(family => family.serie);
        const opponentSeries = opponnetFamilies.map(family => family.serie);
    
        const isFromPlayerFamilies = serie => playerSeries.some(playerSerie => playerSerie === serie);
        const isFromOpponentFamilies = serie => opponentSeries.some(opponentSerie => opponentSerie === serie);
    
        return (card: Card) => {
            const { serie } = cardData[card.id];
            const container = seriesToContainers[serie];
            const cardContainer = card.domElement.parentNode;
        
            if (
                !container ||
                (isFromPlayerFamilies(serie) && cardContainer === this.opponentHandContainer) ||
                (isFromOpponentFamilies(serie) && cardContainer === this.playerHandContainer)
            ) {
                return card;
            }
        
            dom.appendChildWithTransition(card.domElement, container, 500);
            card.domElement.style.setProperty('--index', `${dom.getElementIndex(card.domElement)}px`);
    
            return null;
        };
    }

    updateScores(scoreContainers: Array<HTMLElement>, playerScore: number, opponentScore: number) {
        scoreContainers.forEach((scoreContainer) => {
            switch(scoreContainer.dataset.id) {
                case 'player':
                    this.playerHandContainer.style.setProperty('--score', `"${playerScore}"`);
                break;

                case 'opponent':
                    this.opponentHandContainer.style.setProperty('--score', `"${opponentScore}"`);
                break;

                default: return;
            }
        });
    }

    async revealCards(hiddenCardIds: Array<string>) {
        const hiddenCards = this.game.boardCards.filter(isHidden);

        await Promise.all(hiddenCards.map((card, cardIndex) => {
            card.setCardId(hiddenCardIds[cardIndex]);

            return new Promise((resolve) => {
                window.setTimeout(() => {
                    this.game.moveToBoard(card);
                    resolve();
                }, 450); 
            });
        }));

       this.game.emitReady();
    }

    @socketEvent
    revealOpponentHand(socket, cardIds) {
        this.game.opponentCards.forEach((card, index) => {
            card.setCardId(cardIds[index]);
        });

        window.setTimeout(() => this.game.emitReady(), 1000);
    }

    @socketEvent
    checkFamilies(socket, { player, opponent, common, newPlayerScore, newOpponentScore }: {
        player: Array<Family>,
        opponent: Array<Family>,
        common: Array<Family>,
        newPlayerScore: number,
        newOpponentScore: number,
    }) {
        const containersAndFamilies = [
            { container: this.playerFamiliesContainer, id: 'player', families: player },
            { container: this.opponentFamiliesContainer, id: 'opponent', families: opponent },
            { container: this.commonFamiliesContainer, families: common },
        ];

        const seriesToContainers = containersAndFamilies.reduce((allContainers, { container, families }) => ({
            ...allContainers,
            ...families.reduce(getFamilyContainerReducer(container), {}),
        }), {});

        const cards = this.game.getAllPlayedCards();

        this.tableScoreContainer.classList.remove('hidden');
        this.game.showDialog('families', 0);

        window.requestAnimationFrame(() => {
            const scoreContainers: Array<HTMLElement> = [];
            const reducer = this.getMovedCardToResultsContainer(seriesToContainers, player, opponent);

            this.cardsNotInCompleteFamily = cards.map(reducer).filter(x => !!x);
    
            containersAndFamilies.forEach(({ container, families, id }) => {
                const height = parseInt(window.getComputedStyle(container).height, 10);
                const scrollHeight = container.scrollHeight;

                const totalCards = families.reduce((total, family) => total + family.cardIds.length, 0);
    
                if (totalCards === 0) {
                    container.classList.add('empty');
                } else {
                    container.classList.remove('empty');
                }

                if (totalCards > 0 && container !== this.commonFamiliesContainer) {
                    const deltaScore = `+${totalCards}`;
                    const scoreContainer = document.createElement('div');
                    scoreContainer.className = 'score';
                    scoreContainer.appendChild(document.createTextNode(deltaScore));
                    scoreContainer.dataset.id = id;
    
                    scoreContainers.push(scoreContainer);
    
                    container.insertBefore(scoreContainer, container.firstChild);
                }
    
                if (scrollHeight <= height) {
                    return;
                }
    
                container.style.height = `${40 + height + (scrollHeight - height)}px`;
            });

            window.setTimeout(() => {
                scoreContainers.forEach(container => container.classList.add('visible'));
                this.updateScores(scoreContainers, newPlayerScore, newOpponentScore);
                this.isReadyToHideScores = true;
            }, 500);
        });
    }
}