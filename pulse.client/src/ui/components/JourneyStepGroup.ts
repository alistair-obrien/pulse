import { Component, ComponentModel } from "./Component";
import { Div } from "./Div";
import { JourneyStepCard, JourneyStepCardModel } from "./JourneyStepCard";

export class JourneyStepGroupModel extends ComponentModel<JourneyStepGroup> {
    component = JourneyStepGroup;

    date:string;
    journeyStepCards:JourneyStepCardModel[] = []

    constructor(args: { date:string }) {
        super();
        this.date = args.date;
    }
}

export class JourneyStepGroup extends Component<JourneyStepGroupModel> {
    private readonly separator: HTMLDivElement;
    private readonly journeysContainer: Div;
    private journeyStepCards: JourneyStepCard[] = [];

    constructor() {
        super();

        this.separator = document.createElement("div");
        this.separator.className = "journey-date-separator";
        this.root.append(this.separator);

        this.journeysContainer = new Div();
        this.root.append(this.journeysContainer.root);
    }

    protected render(): void {
        this.separator.textContent = this.model.date;

        this.journeysContainer.root.replaceChildren(); // Clear
        this.journeyStepCards = [];

        this.model.journeyStepCards.forEach(element => {

            const journeyStepCard = new JourneyStepCard();
            journeyStepCard.update(element);
            this.journeysContainer.append(journeyStepCard);
            this.journeyStepCards.push(journeyStepCard);
        });
    }
}
