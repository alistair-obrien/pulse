import { Card, type CardModel } from "../components/Card";
import { Component, ComponentModel } from "../components/Component";
import { Div } from "../components/Div";

export class MeScreen extends Component<MeScreenModel> {

    private readonly cards: Card[] = [];
    private readonly container = new Div();

    constructor() {
        super();

        this.root.className = "screen-container";

        this.root.append(this.container.root);
    }

    protected render() {

        while (this.cards.length < this.model.cards.length) {
            const card = new Card();
            this.cards.push(card);
            this.container.append(card);
        }

        while (this.cards.length > this.model.cards.length) {
            this.cards.pop()!.root.remove();
        }

        this.cards.forEach((card, i) =>
            card.update(this.model.cards[i]));
    }
}

export class MeScreenModel extends ComponentModel<MeScreen> {

    readonly component = MeScreen;

    readonly cards: CardModel[];

    constructor(args: {
        cards: CardModel[];
    }) {
        super();
        this.cards = args.cards;
    }
}