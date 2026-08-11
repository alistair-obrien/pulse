import { Card, type CardModel } from "../components/Card"
import { Component, ComponentModel } from "../components/Component";
import { Div } from "../components/Div";
import { JourneyStepCard, JourneyStepCardModel } from "../components/JourneyStepCard";

export class JourneyScreen extends Component<JourneyScreenModel> {

    private readonly journeySteps: JourneyStepCard[] = [];
    private readonly journeyStepsContainer:Div = new Div();


    constructor() {
        super();

        this.root.className = "screen-container";

        // The content inside the screen
        this.journeyStepsContainer.className = "content";

        this.root.append(this.journeyStepsContainer.root)
    }

    protected render(): void {
        while (this.journeySteps.length < this.model.journeySteps.length) {
            const card = new JourneyStepCard();
            this.journeySteps.push(card);
            this.journeyStepsContainer.append(card);
        }

        while (this.journeySteps.length > this.model.journeySteps.length) {
            this.journeySteps.pop()!.root.remove();
        }

        this.journeySteps.forEach((card, i) =>
            card.update(this.model.journeySteps[i]));
    }
}

export class JourneyScreenModel extends ComponentModel<JourneyScreen> {
        readonly component =  JourneyScreen;

        readonly journeySteps: JourneyStepCardModel[];

        constructor(args: {
            journeySteps: JourneyStepCardModel[];
        }) {
            super();
            this.journeySteps = args.journeySteps
        }
}

// const feedList:HTMLElement = document.createElement("div");

// async function refreshFeed() {
//     const journeySteps = await JourneyController.getAllJourneySteps(new Date());

//     feedList.replaceChildren();

//     if (!journeySteps) {
//         return;
//     }

//     let currentDate = "";

//     for (const journeyStep of journeySteps) {
//         if (journeyStep.date !== currentDate) {
//             currentDate = journeyStep.date;

//             const separator = document.createElement("div");
//             separator.className = "journey-date-separator";
//             separator.textContent = formatDate(currentDate);

//             feedList.append(separator);
//         }

//         feedList.append(new JourneyStepCard(journeyStep).root);
//     }
// }

// function formatDate(date: string): string {
//     const d = new Date(date);

//     return d.toLocaleDateString(undefined, {
//         weekday: "long",
//         day: "numeric",
//         month: "long",
//         year: "numeric",
//     });
// }