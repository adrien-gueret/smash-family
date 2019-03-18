export interface SerieData {
    column: number;
    row: number;
    name: string;
    color: string;
}

interface SerieDataCollection {
    [s: string]: SerieData;
}

const serieData: SerieDataCollection = {
    mario: {
        column: 0,
        row: 0,
        color: '#af3338',
        name: 'Super Mario',
    },
    zelda: {
        column: 1,
        row: 0,
        color: '#5faa5b',
        name: 'The Legend of Zelda',
    },
    kirby: {
        column: 2,
        row: 0,
        color: '#f987bd',
        name: 'Kirby',
    },
    dk: {
        column: 3,
        row: 0,
        color: '#814625',
        name: 'Donkey Kong Country',
    },
    metroid: {
        column: 0,
        row: 1,
        color: '#f87200',
        name: 'Metroid',
    },
    pokemon: {
        column: 1,
        row: 1,
        color: '#ffe059',
        name: 'Pokémon',
    },
    starfox: {
        column: 2,
        row: 1,
        color: '#616161',
        name: 'Star Fox',
    },
    mother: {
        column: 3,
        row: 1,
        color: '#6b93d0',
        name: 'EarthBound ',
    },
}

export default serieData;