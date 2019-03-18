import { Game, Player } from 'ludumjs/server';
import { arrays } from 'ludumjs/common';
import { Family } from '../common/services/family';

function familyCardsSum(families: Array<Family>, initValue: number) {
    return families.reduce((total, family) => (
        total + family.cardIds.length
    ), initValue);
}

class SmashFamilyGame extends Game {
    private deckCardIds: Array<string> = [];
    private player1CardIds: Array<string> = [];
    private player2CardIds: Array<string> = [];
    private hiddenCardIds: Array<string> = [];
    private boardCardIds: Array<string> = [];

    private player1Score: number = 0;
    private player2Score: number = 0;

    turnNumber: number = 0;

    static TURNS_TO_HIDE_CARDS = [3, 4];
    static MAX_TURNS = 6;
    static MAX_SCORE = 10;

    getWinner(): Player|false|null {
        if (this.player1Score < SmashFamilyGame.MAX_SCORE && this.player2Score < SmashFamilyGame.MAX_SCORE) {
            return false;
        }

        if (this.player1Score > this.player2Score) {
            return this.getPlayers()[0];
        } 
        
        if (this.player2Score > this.player1Score) {
            return this.getPlayers()[1];
        }

        return null;
    }

    shouldPlayHiddenCardThisTurn() {
        return SmashFamilyGame.TURNS_TO_HIDE_CARDS.indexOf(this.turnNumber) >= 0;
    }

    updateScores(player1Families: Array<Family>, player2Families: Array<Family>) {
        this.player1Score = familyCardsSum(player1Families, this.player1Score);
        this.player2Score = familyCardsSum(player2Families, this.player2Score);

        const { player1Score, player2Score } = this;

        return { player1Score, player2Score };
    }

    reset(cardIdsToRemove: Array<string>) {
        const newDeck = [
            ...this.getBoard(),
            ...this.deckCardIds,
            ...this.player1CardIds,
            ...this.player2CardIds,
        ];

        cardIdsToRemove.forEach((cardId) => {
            const index = newDeck.indexOf(cardId);

            if (index >= 0) {
                newDeck.splice(index, 1);
            }
        });

        this.setDeck(newDeck);

        this.player1CardIds = [];
        this.player2CardIds = [];
        this.boardCardIds = [];
        this.hiddenCardIds = [];
        this.turnNumber = 0;
    }

    getPlayer1Hand() {
        return this.player1CardIds;
    }

    getPlayer2Hand() {
        return this.player2CardIds;
    }

    getBoard() {
        return [...this.boardCardIds, ...this.hiddenCardIds];
    }

    getTotalCards(): number {
        return this.deckCardIds.length;
    }

    getHiddenCardIds() {
        return this.hiddenCardIds;
    }

    getVisibleCardsNumber(cardIdToCheck: string): number {
        return this.boardCardIds.filter(cardId => cardId === cardIdToCheck).length;
    }

    setDeck(cardIds: Array<string>) {
        this.deckCardIds = arrays.shuffleArray(cardIds);
    }

    popDeckCard(): string {
        return this.deckCardIds.pop();
    }

    player1Draw(): string {
        const cardId = this.popDeckCard();
        this.player1CardIds.push(cardId);

        return cardId;
    }

    player2Draw(): string {
        const cardId = this.popDeckCard();
        this.player2CardIds.push(cardId);

        return cardId;
    }

    player1Play(cardIndex: number, shouldHideCard: boolean = false): string|null {
        return this.moveCardToBoard(this.player1CardIds, cardIndex, shouldHideCard);
    }

    player2Play(cardIndex: number, shouldHideCard: boolean = false): string|null {
        return this.moveCardToBoard(this.player2CardIds, cardIndex, shouldHideCard);
    }

    private moveCardToBoard(source: Array<string>, cardIndex: number, shouldHideCard: boolean): string|null {
        const cardId = source[cardIndex];
        source.splice(cardIndex, 1);

        if (shouldHideCard) {
            this.hiddenCardIds.push(cardId);
            return null;
        } 
    
        this.boardCardIds.push(cardId);
        return cardId;
    }

    boardDraw(shouldHideCard = false) {
        const cardId = this.popDeckCard();

        if (shouldHideCard) {
            this.hiddenCardIds.push(cardId);
            return null;
        }

        this.boardCardIds.push(cardId);
        return cardId;
    }

    isPlayer1(player: Player): boolean {
        return player.uniqId === this.players[0].uniqId;
    }
}

export default SmashFamilyGame;