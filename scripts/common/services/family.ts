import cardData, { CharacterData } from '../data/cards';

export interface Family {
    serie: string;
    cardIds: Array<string>;
}

interface CardsBySerie {
    [key: string]: Array<string>;
}

function getCharacterIdsFromSerie(serieName: string):Array<string> {
    return Object.keys(cardData)
        .map(cardId => ({ cardId, cardData: cardData[cardId] }))
        .filter(({ cardData }) => cardData.serie === serieName)
        .map(({ cardId }) => cardId);
}

function aggregateBySeries(cardIds: Array<string>): CardsBySerie {
    return cardIds.reduce((families, cardId) => {
        const { serie } = cardData[cardId];

        if (!families[serie]) {
            families[serie] = [];
        }

        families[serie].push(cardId);

        return families;
    }, {});
}

function transformIntoFamilies(cards: CardsBySerie): Array<Family> {
    return Object.keys(cards).map(serie => ({
        serie,
        cardIds: cards[serie],
    }));
}

function isFamilyComplete(family: Family): boolean {
    const serieCardIds = getCharacterIdsFromSerie(family.serie);
    
    return serieCardIds.every(cardId => family.cardIds.indexOf(cardId) >= 0);
}

function filterCompleteFamilies(families: Array<Family>): Array<Family> {
    return families.filter(isFamilyComplete);
}

export function getCompleteFamilies(cardIds: Array<string>): Array<Family> {
    const aggregatedCards = aggregateBySeries(cardIds);
    
    return filterCompleteFamilies(transformIntoFamilies(aggregatedCards));
}

export function getCharactersFromSerie(serieName: string):Array<CharacterData> {
    return getCharacterIdsFromSerie(serieName).map(cardId => cardData[cardId]);
}