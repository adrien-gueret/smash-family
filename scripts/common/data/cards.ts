export interface CharacterData {
    column: number;
    row: number;
    name: string;
    serie: string;
}

interface CharacterDataCollection {
    [s: string]: CharacterData;
}

const cardData: CharacterDataCollection = {
    mario: {
        column: 0,
        row: 0,
        name: 'Mario',
        serie: 'mario',
    },
    luigi: {
        column: 1,
        row: 0,
        name: 'Luigi',
        serie: 'mario',
    },
    peach: {
        column: 2,
        row: 0,
        name: 'Peach',
        serie: 'mario',
    },
    link: {
        column: 3,
        row: 0,
        name: 'Link',
        serie: 'zelda',
    },
    zelda: {
        column: 0,
        row: 1,
        name: 'Zelda',
        serie: 'zelda',
    },
    kirby: {
        column: 1,
        row: 1,
        name: 'Kirby',
        serie: 'kirby',
    },
    metaknight: {
        column: 2,
        row: 1,
        name: 'Meta Knight',
        serie: 'kirby',
    },
    dedede: {
        column: 3,
        row: 1,
        name: 'King Dedede',
        serie: 'kirby',
    },
    donkey: {
        column: 0,
        row: 2,
        name: 'Donkey Kong',
        serie: 'dk',
    },
    diddy: {
        column: 1,
        row: 2,
        name: 'Diddy Kong',
        serie: 'dk',
    },
    krool: {
        column: 2,
        row: 2,
        name: 'K.Rool',
        serie: 'dk',
    },
    samus: {
        column: 3,
        row: 2,
        name: 'Samus',
        serie: 'metroid',
    },
    ridley: {
        column: 0,
        row: 3,
        name: 'Ridley',
        serie: 'metroid',
    },
    pikachu: {
        column: 1,
        row: 3,
        name: 'Pikachu',
        serie: 'pokemon',
    },
    mewtwo: {
        column: 2,
        row: 3,
        name: 'Mewtwo',
        serie: 'pokemon',
    },
    jigglypuf: {
        column: 3,
        row: 3,
        name: 'Jigglypuf',
        serie: 'pokemon',
    },
    fox: {
        column: 0,
        row: 4,
        name: 'Fox',
        serie: 'starfox',
    },
    falco: {
        column: 1,
        row: 4,
        name: 'Falco',
        serie: 'starfox',
    },
    ness: {
        column: 2,
        row: 4,
        name: 'Ness',
        serie: 'mother',
    },
    lucas: {
        column: 3,
        row: 4,
        name: 'Lucas',
        serie: 'mother',
    },
};

export default cardData;