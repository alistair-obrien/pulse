import "../styles/shared-journey-entry.css";
import { Card, CardModel } from './Card';
import { ProfileThumbnail } from './ProfileThumbnail';

import { Component, ComponentModel } from "./Component";

// export class JourneyStepGroup extends Component<JourneyStepGroupModel> {

// }

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

    protected render(): void {

        this.logCard.update(this.model.card);
    }
}

export class JourneyStepCardModel extends ComponentModel<JourneyStepCard> {
    readonly component = JourneyStepCard;
    
    card:CardModel = new CardModel({ content: [] })
}