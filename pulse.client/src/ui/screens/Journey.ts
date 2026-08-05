import "../styles/main.css"
// import { Card } from "../components/Card";
// import { CardHeader } from "../components/CardHeader";
// import { JourneyStepCard } from '../components/JourneyStepCard';
// import * as JourneyController from "../../controllers/JourneyController"

// const feedList:HTMLElement = document.createElement("div");

export function render(): HTMLElement {
        const screenContainer = document.createElement("div");
        screenContainer.className = "screen-container";

        // const dateCard = new Card();
        // const header = new CardHeader("Journey")
        // dateCard.append(header.root);

        // feedList.className = "content";
    
        // screenContainer.append(
        //     dateCard.root,
        //     feedList
        // );

        // refreshFeed();

        return screenContainer;
}

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