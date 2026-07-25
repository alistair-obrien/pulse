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