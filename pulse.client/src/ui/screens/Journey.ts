import { Component, ComponentModel } from "../components/Component";
import { Div } from "../components/Div";
import { JourneyStepGroup, type JourneyStepGroupModel } from "../components/JourneyStepGroup";

export class JourneyScreen extends Component<JourneyScreenModel> {

    private readonly journeyStepGroups: JourneyStepGroup[] = [];
    private readonly journeyStepsContainer: Div = new Div();

    constructor() {
        super();

        this.root.className = "screen-container";

        this.journeyStepsContainer.className = "content";

        this.root.append(
            this.journeyStepsContainer.root
        );
    }

    protected render(): void {
        while (this.journeyStepGroups.length < this.model.journeyStepGroups.length) {
            const card = new JourneyStepGroup();
            this.journeyStepGroups.push(card);
            this.journeyStepsContainer.append(card);
        }

        while (this.journeyStepGroups.length > this.model.journeyStepGroups.length) {
            this.journeyStepGroups.pop()!.root.remove();
        }

        this.journeyStepGroups.forEach((card, i) =>
            card.update(this.model.journeyStepGroups[i])
        );
    }
}

export class JourneyScreenModel extends ComponentModel<JourneyScreen> {
        readonly component =  JourneyScreen;

        readonly journeyStepGroups: JourneyStepGroupModel[];

        constructor(args: {
            journeySteps: JourneyStepGroupModel[];
        }) {
            super();
            this.journeyStepGroups = args.journeySteps
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