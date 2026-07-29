import * as api from "../api/API";
import { metricRepository } from "./MetricRepositoryController";
import { MetricTypeIds, type MetricTypes } from "../models/MetricRegistry";
import { JourneyStep } from "../models/JourneyStep";
import { ToDateKey } from "../data-store/DateKey";
import * as Auth from "./AuthController"

const DEFAULT_JOURNEY_STEP_METRICS  = [
    MetricTypeIds.Reflection,
    MetricTypeIds.Steps,
    MetricTypeIds.Sleep,
    MetricTypeIds.Nutrition_Calories,
    MetricTypeIds.Nutrition_Protein,
    MetricTypeIds.Nutrition_Carbs,
    MetricTypeIds.Nutrition_Fat,
    MetricTypeIds.Workouts
] as const;

export async function publish(date: Date) {
    let dateKey = ToDateKey(date);
    void dateKey;

    await api.putJournalStep(dateKey);
}

export async function getAllJourneySteps(date: Date) : Promise<JourneyStep[] | null> {
    let dateKey = ToDateKey(date);
    void dateKey;

    // If we have no online account then we should get from local storage.

    let journeySteps:JourneyStep[];

    // Remote Construction since we need other users specifically exposed metrics
    if (Auth.isLoggedIn()) {
        const journeyStepsResponse = await api.getJourneySteps(0);
        journeySteps = journeyStepsResponse?.journeySteps ?? [];
    // Local Construction
    } else {
       journeySteps = [];
       
       const today = new Date();
       for (let i = 0; i < 10; i++) {
            const selDate = new Date(today);
            selDate.setDate(today.getDate() - i);

            const dateKey = ToDateKey(selDate);

            const metrics:Partial<MetricTypes> = metricRepository.resolveMetrics(dateKey, ...DEFAULT_JOURNEY_STEP_METRICS );

            console.log(JSON.stringify(metrics));

            const journeyStep = JourneyStep.fromJson({
                id: "local",
                date: dateKey,
                userName: "Ali",
                userProfilePicture: "",
                liked: true,
                likesCount: 42,
                comments: [],
                metrics,
            });
            journeySteps.push(journeyStep);
       }
    }

    return journeySteps;
}

export async function likeJourneyStep(journeyStep: JourneyStep) : Promise<{ liked: boolean }> {
    // Need just the journey id
    return await api.likeJourneyStep(journeyStep.date, journeyStep.userId);
}

