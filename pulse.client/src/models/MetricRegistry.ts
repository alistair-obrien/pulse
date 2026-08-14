import type { SleepLogData } from "./SleepLogData";
import type { ActivityLogData } from "./ActivityLogData";

export const metricsRegistry = {
    // Recovery
    "Steps": {
        defaultValue: 0 as number,
    },
    "RestingHeartRate": {
        defaultValue: 0 as number,
    },
    "Sleep": {
        defaultValue: [] as SleepLogData[],
    },

    // Nutrition
    "Nutrition_Calories": {
        defaultValue: 0 as number,
    },
    "Nutrition_Protein": {
        defaultValue: 0 as number,
    },
    "Nutrition_Carbs": {
        defaultValue: 0 as number,
    },
    "Nutrition_Fat": {
        defaultValue: 0 as number,
    },
    "Nutrition_Notes": {
        defaultValue: "" as string,
    },

    // Reflection
    "Reflection": {
        defaultValue: "" as string,
    },

    // Body
    "Weight": {
        defaultValue: 0 as number,
    },

    // Activity
    "Activities": {
        defaultValue: [] as ActivityLogData[],
    },
} as const;

export type MetricTypes = {
    [K in keyof typeof metricsRegistry]:
        typeof metricsRegistry[K]["defaultValue"];
};

export type MetricTypeId = keyof typeof metricsRegistry;

export type StringMetricTypeId = {
    [K in MetricTypeId]: MetricTypes[K] extends string ? K : never
}[MetricTypeId];

export const MetricTypeIds = Object.fromEntries(
    Object.keys(metricsRegistry).map(key => [key, key])
) as {
    readonly [K in MetricTypeId]: K;
};

export const MetricTypeIdsArray = Object.freeze(
    Object.keys(metricsRegistry)
) as readonly MetricTypeId[];