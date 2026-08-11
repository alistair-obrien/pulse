import "../styles/shared-journey-entry.css";
import type { JourneyStep } from "../../models/JourneyStep";
import { MetricTypeIds } from "../../models/MetricRegistry";
// import { ActionButton } from './ActionButton';
import { Card } from './Card';
// import { ICONS } from './ICONS';
import { ProfileThumbnail } from './ProfileThumbnail';
// import { WORKOUT_ICONS } from "./WORKOUT_ICONS";

// import * as AuthController from "../../controllers/AuthController"
// import * as JourneyController from "../../controllers/JourneyController"
// import { MetricCard } from "./MetricCard";
// import { TimeSpan } from "./TimeSpan";
// import { MetricRow } from "./MetricRow";
// import { MetricText } from "./MetricText";
import { TextBlock } from "./TextBlock";
import { ComponentModel } from "./Component";

export class JourneyStepCard {
    readonly root: HTMLElement;

    // TODO: Pass Journey entry template and data
    constructor(journeyStep:JourneyStep) {
        this.root = document.createElement("div");
        this.root.className = "shared-journey-entry";
    
        const logCard = new Card();
        this.root.append(logCard.root);    

        // >>> HEADER <<<
        const topRow = document.createElement("div");
        logCard.append(
            topRow
        );

        topRow.className = "header-row";
        const profileCircle = new ProfileThumbnail(journeyStep.userProfilePicture, () => { });
        topRow.append(profileCircle.root);

        const userName = document.createElement("h1");
        userName.textContent = journeyStep.userName;
        topRow.append(userName);


        // >>> CONTENT <<<
        // Reflection
        logCard.append(new TextBlock(journeyStep.getMetric(MetricTypeIds.Reflection)).root);
        // Recovery

        // Sleep
        // const sleepRecords = journeyStep.getMetric(MetricTypeIds.Sleep);
        // const totalSleepHours = sleepRecords.reduce(
        //     (total, sleep) => total + sleep.sleepHours,
        //     0
        // );
        
        const row = document.createElement("div");
        row.className = "metric-grid-3";
        logCard.append(row);

        // // Recovery
        // const sleepText = new TimeSpan(totalSleepHours);
        // const sleepCard = new MetricCard({
        //     name: "Total Sleep", 
        //     metricValue: sleepText.root, 
        //     iconClass: ICONS.Sleep})
             
        // row.append(sleepCard.root);
        // row.append(new MetricCard({ 
        //         name:"Steps", 
        //         metricValue: new MetricText(journeyStep.getMetric(MetricTypeIds.Steps).toLocaleString()).root, 
        //         iconClass: ICONS.Steps
        //     })
        //     .root);
        
        // // Activities
        // const activitiesRow = document.createElement("div");
        // activitiesRow.className = "metric-grid-3";
        // logCard.append(activitiesRow);
        // const workoutRecords = journeyStep.getMetric(MetricTypeIds.Workouts);
        // for (const workout of workoutRecords) {
        //     const icon = WORKOUT_ICONS[workout.workoutType] ?? ICONS.Activity;
        //     const workoutDurationElement =  new TimeSpan(workout.workoutDuration / 60);
        //     const restingHeartRateCard = new MetricCard({
        //         name: workout.workoutType, 
        //         metricValue: workoutDurationElement.root, 
        //         iconClass: icon}); 

        //     const notes = document.createElement("textarea");
        //     notes.placeholder = "Any workout notes?";

        //     activitiesRow.append(restingHeartRateCard.root);
        // }

        // // Nutrition
        // logCard.append(new MetricRow("Calories", new MetricText(Math.round(journeyStep.getMetric(MetricTypeIds.Nutrition_Calories)).toLocaleString()).root, ICONS.None).root);
        // logCard.append(new MetricRow("Protein", new MetricText(Math.round(journeyStep.getMetric(MetricTypeIds.Nutrition_Protein)).toLocaleString()).root, ICONS.None).root);
        // logCard.append(new MetricRow("Carbs", new MetricText(Math.round(journeyStep.getMetric(MetricTypeIds.Nutrition_Carbs)).toLocaleString()).root, ICONS.None).root);
        // logCard.append(new MetricRow("Fat", new MetricText(Math.round(journeyStep.getMetric(MetricTypeIds.Nutrition_Fat)).toLocaleString()).root, ICONS.None).root);
        


        // // >>> FOOTER <<<
        // // Bottom Action Row
        // const actionRow = document.createElement("div");
        // actionRow.className = "footer-action-buttons-row";

        // if (AuthController.isLoggedIn()) {
        //     const commentButton = new ActionButton("", ICONS.Comment, () => { });
        //     const likeButton = new ActionButton("", journeyStep.liked ? ICONS.LikeFilled : ICONS.Like, async () => 
        //         { 
        //             var likeResponse = await JourneyController.likeJourneyStep(journeyStep);
        //             if (likeResponse.liked) {
        //                 likeButton.changeIcon(ICONS.LikeFilled);
        //             } 
        //             else
        //             {
        //                 likeButton.changeIcon(ICONS.Like);
        //             }
        //         });
        //     actionRow.append(
        //         commentButton.root,
        //         journeyStep.likesCount.toString(),
        //         likeButton.root
        //     );
        // }

        // logCard.append(
        //     actionRow
        // );
    }
}
