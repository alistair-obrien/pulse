import type { SleepLogData } from "../models/DailyLog";
import { ToDateKey } from "../models/DateKey";
import { metricRepository } from "../models/MetricRepository";
import { MetricTypeIds } from "../models/MetricRegistry";
import { HealthConnect, healthConnectAvailable } from "../platform/health-connect";
import { getLocalDayUtcRange } from "./DateTime";

type HealthConnectData = {
    steps: Awaited<ReturnType<typeof HealthConnect.readSteps>>;
    restingHeartRate: Awaited<ReturnType<typeof HealthConnect.readRestingHeartRate>>;
    sleep: Awaited<ReturnType<typeof HealthConnect.readSleep>>;
    nutrition: Awaited<ReturnType<typeof HealthConnect.readNutrition>>;
};

const IMPORTERS = [
    {
        metric: MetricTypeIds.Steps,
        value: (hc: HealthConnectData) => hc.steps.totalSteps
    },
    {
        metric: MetricTypeIds.RestingHeartRate,
        value: (hc: HealthConnectData) => hc.restingHeartRate.averageRestingHeartRate
    },
    {
        metric: MetricTypeIds.Sleep,
        value: (hc: HealthConnectData): SleepLogData[] =>
            hc.sleep.sessions.map(session => ({
                sleepHours:
                    (new Date(session.endTime).getTime() -
                     new Date(session.startTime).getTime()) /
                    (1000 * 60 * 60),
                sleepNotes: session.notes ?? ""
            }))
    },
    {
        metric: MetricTypeIds.Nutrition_Calories,
        value: (hc: HealthConnectData) => hc.nutrition.totalCalories
    },
    {
        metric: MetricTypeIds.Nutrition_Protein,
        value: (hc: HealthConnectData) => hc.nutrition.totalProtein
    },
    {
        metric: MetricTypeIds.Nutrition_Carbs,
        value: (hc: HealthConnectData) => hc.nutrition.totalCarbohydrates
    },
    {
        metric: MetricTypeIds.Nutrition_Fat,
        value: (hc: HealthConnectData) => hc.nutrition.totalFats
    }
] as const;

let syncing = false;

export async function healthConnectSync(date: Date) {

    if (!healthConnectAvailable) {
        console.log("Health Sync not available on this device.");
        return;
    }

    if (syncing)
        return;

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

        const healthData: HealthConnectData = {
            steps,
            restingHeartRate,
            sleep,
            nutrition
        };

        for (const { metric, value } of IMPORTERS) {
            metricRepository.deviceCacheStore.Set(
                dateKey,
                metric,
                value(healthData)
            );
        }
    }
    finally {
        syncing = false;
    }
}