import SmashFamilyGameFactory from './SmashFamilyGameFactory';

declare const process;

const gameFactory = new SmashFamilyGameFactory();

gameFactory.listen(process.env.PORT || 80);