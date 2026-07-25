import type { SleepLogData } from "../models/DailyLog";
import { ToDateKey } from "../models/DateKey";
import { MetricRecord } from "../models/MetricRecord";
import { metricRepository } from "../models/MetricRepository";
import { MetricTypeIds } from "../models/MetricTypeIds";
import { HealthConnect, healthConnectAvailable } from "../platform/health-connect";
import { getLocalDayUtcRange } from "./DateTime";

let syncing = false;

export async function healthConnectSync(date:Date) {
    
    if (!healthConnectAvailable) {
        console.log("Health Sync not available on this device.")
        return;
    }

    if (syncing) {
        return;
    }
    
    syncing = true;

    try {
        const dateRange = getLocalDayUtcRange(date);
        const dateKey = ToDateKey(date);

        const [
            steps,
            restingHeartRate,
            sleep,
            nutrition
        ] = await Promise.all([
            HealthConnect.readSteps(dateRange),
            HealthConnect.readRestingHeartRate(dateRange),
            HealthConnect.readSleep(dateRange),
            HealthConnect.readNutrition(dateRange)
        ]);

        // >>> STEPS <<<        
        metricRepository.deviceCacheStore.Set(
            dateKey,
            new MetricRecord<number>(MetricTypeIds.Steps, steps.totalSteps)
        );

        // >>> RHR <<<
        metricRepository.deviceCacheStore.Set(
            dateKey,
            new MetricRecord<number>(MetricTypeIds.RestingHeartRate, restingHeartRate.averageRestingHeartRate)
        );

        // >>> SLEEP <<<
        const sleepRecord = sleep.sessions.map(session => ({
            sleepHours:
                (new Date(session.endTime).getTime() -
                 new Date(session.startTime).getTime()) /
                (1000 * 60 * 60),
            sleepNotes: session.notes ?? ""
        }));
        metricRepository.deviceCacheStore.Set(
            dateKey,
            new MetricRecord<SleepLogData[]>(MetricTypeIds.Sleep, sleepRecord )
        );

        // >>> NUTRITION <<<
        metricRepository.deviceCacheStore.Set(
            dateKey,
            new MetricRecord<number>(MetricTypeIds.Nutrition_Calories, nutrition.totalCalories )
        );

        metricRepository.deviceCacheStore.Set(
            dateKey,
            new MetricRecord<number>(MetricTypeIds.Nutrition_Protein, nutrition.totalProtein )
        );

        metricRepository.deviceCacheStore.Set(
            dateKey,
            new MetricRecord<number>(MetricTypeIds.Nutrition_Carbs, nutrition.totalCarbohydrates )
        );

        metricRepository.deviceCacheStore.Set(
            dateKey,
            new MetricRecord<number>(MetricTypeIds.Nutrition_Fat, nutrition.totalFats )
        );
    }
    finally {
        syncing = false;
    }
}