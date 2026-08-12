import "../styles/shared-journey-entry.css";
import { Card, CardModel } from './Card';

import { Component, ComponentModel } from "./Component";

export class JourneyStepCard extends Component<JourneyStepCardModel> {

    readonly root: HTMLElement;
    readonly logCard: Card;


    // TODO: Pass Journey entry template and data
    constructor() {
        super()
        this.root = document.createElement("div");
        this.root.className = "shared-journey-entry";
    
        this.logCard = new Card();
        this.root.append(this.logCard.root);
    }

    protected render(): void {

        this.logCard.update(this.model.card);
    }
}

export class JourneyStepCardModel extends ComponentModel<JourneyStepCard> {
    readonly component = JourneyStepCard;
    
    card:CardModel = new CardModel({ content: [] })
}