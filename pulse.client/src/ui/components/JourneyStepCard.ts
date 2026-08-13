import "../styles/shared-journey-entry.css";
import { Card, CardModel } from "./Card";
import { Component, ComponentModel } from "./Component";
import {
    JourneyContextPopup,
    JourneyContextPopupModel
} from "./JourneyContextPopup";

export class JourneyStepCard extends Component<JourneyStepCardModel> {

    readonly root: HTMLElement;
    readonly logCard: Card;
    readonly contextPopup: JourneyContextPopup;

    constructor() {
        super();

        this.root = document.createElement("div");
        this.root.className = "shared-journey-entry";

        this.logCard = new Card();
        this.contextPopup = new JourneyContextPopup();

        this.root.append(
            this.logCard.root,
            this.contextPopup.root
        );
    }

    protected render(): void {
        this.logCard.update(this.model.card);
        this.contextPopup.update(this.model.contextPopup);
    }

    showContextPopup() {
        this.model.contextPopup.visible = true;
        this.contextPopup.update(this.model.contextPopup);
    }

    hideContextPopup() {
        this.model.contextPopup.visible = false;
        this.contextPopup.update(this.model.contextPopup);
    }
}

export class JourneyStepCardModel extends ComponentModel<JourneyStepCard> {

    readonly component = JourneyStepCard;

    card: CardModel = new CardModel({
        content: []
    });

    contextPopup: JourneyContextPopupModel = new JourneyContextPopupModel({ onEdit: () => null, onUnpublish: () => null });
}