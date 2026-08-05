import "../styles/card.css";
import { Component, ComponentModel } from "./Component";

// Can use unions in cases where we ant to constrain the allowed types
// export type CardContent =
//     | CardHeaderModel
//     | MetricCardModel
//     | ActionButtonModel;

export class CardModel extends ComponentModel<Card> {
    readonly component = Card;
    
    content:ComponentModel<any>[]

    constructor(args: {
        content:ComponentModel<any>[];
    }) {
        super();

        this.content = args.content;
    }
}

export class Card extends Component<CardModel> {

    constructor() {
        super();
        this.root.className = "card";
    }

    protected render(): void {

        const children: HTMLElement[] = [];

        this.model.content.forEach(element => {
            const comp = new element.component;
            comp.update(element);
            children.push(comp.root);
        });

        this.root.replaceChildren(...children);
    }
}