import cardData from '../../common/data/cards';
import serieData from '../../common/data/series';
import { getCharactersFromSerie } from '../../common/services/family';

class Card {
    static template: HTMLTemplateElement = document.getElementById('card-template') as HTMLTemplateElement
    static templateCharacterIcon: HTMLTemplateElement = document.getElementById('character-icon-template') as HTMLTemplateElement;
    
    domElement: HTMLElement;
    spriteRow: number;
    spriteColumn: number;
    timeoutTurnFace: number;
    id: string|null;

    constructor(id: string|null = null) {
        const templateContent = Card.template.content.cloneNode(true) as HTMLElement;

        this.domElement = templateContent.querySelector('.card');
        this.setCardId(id);
    }

    turnFaceDown(): this {
        this.id = null;
        this.domElement.classList.add('card--face-down');

        this.timeoutTurnFace = window.setTimeout(() => {
            this.domElement.style.setProperty('--background-color', '#000');

            const name = this.domElement.querySelector('.card__name') as HTMLElement;
            name.innerHTML = '';
    
            const illustration = this.domElement.querySelector('.card__illustration') as HTMLElement;
            illustration.style.setProperty('--sprite-column','0');
            illustration.style.setProperty('--sprite-row', '0');
            illustration.removeAttribute('title');
    
            const symbol = this.domElement.querySelector('.card__symbol') as HTMLElement;
            symbol.style.setProperty('--sprite-column', '0');
            symbol.style.setProperty('--sprite-row', '0');
            symbol.removeAttribute('title');
    
            const family = this.domElement.querySelector('.card__family') as HTMLElement;
            family.innerHTML = '';
        }, 600);

        return this;
    }

    setCardId(id: string|null): this {
        this.id = id;
        this.timeoutTurnFace && window.clearTimeout(this.timeoutTurnFace);
        
        const character = cardData[id];

        if (!character) {
            return this.turnFaceDown();
        }

        const serie = serieData[character.serie];

        this.domElement.style.setProperty('--background-color', serie.color);

        const name = this.domElement.querySelector('.card__name') as HTMLElement;
        name.innerHTML = '';
        name.appendChild(document.createTextNode(character.name));

        const illustration = this.domElement.querySelector('.card__illustration') as HTMLElement;
        illustration.style.setProperty('--sprite-column', `${character. column}`);
        illustration.style.setProperty('--sprite-row', `${character.row}`);
        illustration.setAttribute('title', character.name);

        const symbol = this.domElement.querySelector('.card__symbol') as HTMLElement;
        symbol.style.setProperty('--sprite-column', `${serie. column}`);
        symbol.style.setProperty('--sprite-row', `${serie.row}`);
        symbol.setAttribute('title', serie.name);

        const family = this.domElement.querySelector('.card__family') as HTMLElement;
        family.innerHTML = '';

        const familyFragment = document.createDocumentFragment();

        getCharactersFromSerie(character.serie).forEach((characterIcon) => {
            const templateCharacterIconContent = Card.templateCharacterIcon.content.cloneNode(true) as HTMLElement;
            const icon = templateCharacterIconContent.querySelector('.card__characterIcon') as HTMLElement;
            icon.style.setProperty('--sprite-column', `${characterIcon. column}`);
            icon.style.setProperty('--sprite-row', `${characterIcon.row}`);
            icon.setAttribute('title', characterIcon.name);

            if (characterIcon.name === character.name) {
                icon.classList.add('card__characterIcon--active');
            }

            familyFragment.appendChild(icon);
        });

        family.appendChild(familyFragment);

        this.domElement.classList.remove('card--face-down');

        return this;
    }
}

export default Card;