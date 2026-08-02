import type { DateKey } from "../../data-store/DateKey";
import { metricRepository } from "../../controllers/MetricRepositoryController";
import type { JourneyStep } from "../../models/JourneyStep";
import { MetricTypeIds, type StringMetricTypeId } from "../../models/MetricRegistry";
import "../styles/shared-journey-entry.css";
import { ActionButton } from './ActionButton';
import { Card } from './Card';
import { ICONS } from './ICONS';
import { ProfileThumbnail } from './ProfileThumbnail';
import { WORKOUT_ICONS } from "./WORKOUT_ICONS";

import * as AuthController from "../../controllers/AuthController"
import * as JourneyController from "../../controllers/JourneyController"

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
        const profileCircle = new ProfileThumbnail("", () => { });
        topRow.append(profileCircle.root);

        const userName = document.createElement("h1");
        userName.textContent = journeyStep.userName;
        topRow.append(userName);


        // >>> CONTENT <<<
        // Reflection
        logCard.append(new TextBlock(journeyStep.getMetric(MetricTypeIds.Reflection)).root);
        // Recovery

        // Sleep
        const sleepRecords = journeyStep.getMetric(MetricTypeIds.Sleep);
        const totalSleepHours = sleepRecords.reduce(
            (total, sleep) => total + sleep.sleepHours,
            0
        );
        
        const row = document.createElement("div");
        row.className = "metric-grid-3";
        logCard.append(row);

        // Recovery
        const sleepText = new TimeSpan(totalSleepHours);
        const sleepCard = new MetricCard("Total Sleep", sleepText.root, ICONS.Sleep) 
        row.append(sleepCard.root);
        row.append(new MetricCard("Steps", new MetricText(journeyStep.getMetric(MetricTypeIds.Steps).toLocaleString()).root, ICONS.Steps).root);
        
        // Activities
        const activitiesRow = document.createElement("div");
        activitiesRow.className = "metric-grid-3";
        logCard.append(activitiesRow);
        const workoutRecords = journeyStep.getMetric(MetricTypeIds.Workouts);
        for (const workout of workoutRecords) {
            const icon = WORKOUT_ICONS[workout.workoutType] ?? ICONS.Activity;
            const workoutDurationElement =  new TimeSpan(workout.workoutDuration / 60);
            const restingHeartRateCard = new MetricCard(workout.workoutType, workoutDurationElement.root, icon); 

            const notes = document.createElement("textarea");
            notes.placeholder = "Any workout notes?";

            activitiesRow.append(restingHeartRateCard.root);
        }

        // Nutrition
        logCard.append(new MetricRow("Calories", new MetricText(Math.round(journeyStep.getMetric(MetricTypeIds.Nutrition_Calories)).toLocaleString()).root, ICONS.None).root);
        logCard.append(new MetricRow("Protein", new MetricText(Math.round(journeyStep.getMetric(MetricTypeIds.Nutrition_Protein)).toLocaleString()).root, ICONS.None).root);
        logCard.append(new MetricRow("Carbs", new MetricText(Math.round(journeyStep.getMetric(MetricTypeIds.Nutrition_Carbs)).toLocaleString()).root, ICONS.None).root);
        logCard.append(new MetricRow("Fat", new MetricText(Math.round(journeyStep.getMetric(MetricTypeIds.Nutrition_Fat)).toLocaleString()).root, ICONS.None).root);
        


        // >>> FOOTER <<<
        // Bottom Action Row
        const actionRow = document.createElement("div");
        actionRow.className = "footer-action-buttons-row";

        if (AuthController.isLoggedIn()) {
            const commentButton = new ActionButton("", ICONS.Comment, () => { });
            const likeButton = new ActionButton("", journeyStep.liked ? ICONS.LikeFilled : ICONS.Like, async () => 
                { 
                    var likeResponse = await JourneyController.likeJourneyStep(journeyStep);
                    if (likeResponse.liked) {
                        likeButton.changeIcon(ICONS.LikeFilled);
                    } 
                    else
                    {
                        likeButton.changeIcon(ICONS.Like);
                    }
                });
            actionRow.append(
                commentButton.root,
                journeyStep.likesCount.toString(),
                likeButton.root
            );
        }

        logCard.append(
            actionRow
        );
    }
}

//01:51:00
//13.933333333333334
export class TimeSpan {
    readonly root: HTMLElement;

    constructor(time:number | string) {
        this.root = document.createElement("div");
        this.root.className = "metric-time-span";

        let hours: number;
        let minutes: number;

        if (typeof time === "number") {
            hours = Math.floor(time);
            minutes = Math.round((time - hours) * 60);
        } else {
            const [h, m] = time.split(":").map(Number);
            hours = h;
            minutes = m;
        }

        if (hours > 0) {
            this.root.append(new MetricText(hours.toString(), "h").root)
        }

        this.root.append(new MetricText(minutes.toString(), "m").root);
    }
}

export class MetricText {
    readonly root: HTMLElement;
    constructor(value: string, unit?: string) {
        this.root = document.createElement("div");
        this.root.className = "metric-value";
        this.root.append(document.createTextNode(value));
        if (unit) {
            const span = document.createElement("span");
            span.className = "metric-unit";
            span.textContent = ` ${unit}`;
            this.root.append(span);
        }
    }
}

export class MetricCard {

    readonly root: HTMLElement;
    constructor(metricName:string, metricValue:HTMLElement, metricIconClass:string) {
        this.root = document.createElement("div");
        this.root.className = "metric-card";
        
        const icon = document.createElement("i");
        icon.className = metricIconClass;
        
        const name = document.createElement("div");
        name.className = "metric-label-text";
        name.textContent = metricName;
        
        // innerCard.append(icon, metricValue, name);
        this.root.append(icon, name, metricValue);
    }
}

export class MetricRow {
    readonly root: HTMLElement;

    constructor(metricName:string, metricValue:HTMLElement, metricIconClass:string | null = null) {
        this.root = document.createElement("div");
        this.root.className = "metric-row";

        const labelContainer = document.createElement("div");
        labelContainer.className = "metric-label-container"

        const icon = document.createElement("i");
        if (metricIconClass != null)
        {
            icon.className = metricIconClass!;
            labelContainer.append(icon);
        }

        const label = document.createElement("div");
        label.className = "metric-label-text";
        label.textContent = metricName;
        labelContainer.append(label);

        this.root.append(labelContainer, metricValue);
    }
}

export class TextBlock {
    readonly root: HTMLElement;

    constructor(text: string) {
        this.root = document.createElement("div");
        this.root.className = "text-block";
        this.root.textContent = text;
    }
}

export class MetricTextInputField {
    
    readonly root: HTMLElement;

    constructor(placeholderText: string, metricTypeId: StringMetricTypeId, selectedDateKey:DateKey) {
        this.root = document.createElement("div");
        this.root.className = "text-area";
    
        const icon = document.createElement("i");
        icon.className = ICONS.EditTextField;
        this.root.append(icon);
    
        const textArea = document.createElement("textarea");
        textArea.placeholder = placeholderText;
        this.root.append(textArea);
    
        const getter = () =>
            metricRepository.resolveMetric(selectedDateKey, metricTypeId);
    
        const setter = (value: string) =>
            metricRepository.setMetric(selectedDateKey, metricTypeId, value);
    
        textArea.value = getter();
        textArea.oninput = () => setter(textArea.value);
    }
}