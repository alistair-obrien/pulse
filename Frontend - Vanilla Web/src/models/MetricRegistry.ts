import type { SleepLogData, WorkoutLogData } from "./DailyLog";

export type MetricTypeId = string;

export const MetricTypeIds = {
    Steps: "steps",
    RestingHeartRate: "restingHeartRate",
    Sleep: "sleep",

    Nutrition_Notes: "nutrition.notes",
    Nutrition_Calories: "nutrition.calories",
    Nutrition_Protein: "nutrition.protein",
    Nutrition_Carbs: "nutrition.carbs",
    Nutrition_Fat: "nutrition.fat",
    
    Reflection: "reflection",
    Weight: "weight",

    Workouts: "workouts",
} as const;

export const metricsRegistry = [
    {
        id: MetricTypeIds.Reflection,
        defaultValue: ""
    },
    {
        id: MetricTypeIds.Steps,
        defaultValue: 0
    },
    {
        id: MetricTypeIds.RestingHeartRate,
        defaultValue: 0
    },
    {
        id: MetricTypeIds.Sleep,
        defaultValue: [] as SleepLogData[]
    },
    {
        id: MetricTypeIds.Nutrition_Calories,
        defaultValue: 0
    },
    {
        id: MetricTypeIds.Nutrition_Protein,
        defaultValue: 0
    },
    {
        id: MetricTypeIds.Nutrition_Carbs,
        defaultValue: 0
    },
    {
        id: MetricTypeIds.Nutrition_Fat,
        defaultValue: 0
    },
    {
        id: MetricTypeIds.Nutrition_Notes,
        defaultValue: ""
    },
    {
        id: MetricTypeIds.Workouts,
        defaultValue: [] as WorkoutLogData[]
    }
] as const;