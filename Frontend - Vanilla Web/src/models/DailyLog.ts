
// >>> DATA <<<
export interface DailyLogData {
    date: string;
    reflection: string;
    sleeps: SleepLogData[];
    nutrition: NutritionData;
    workouts: WorkoutLogData[];
    weight: number;
    bodyFatPercentage: number;
    restingHeartRate: number;
    steps: number;
    sharePublicly: boolean; 
    isPublished: boolean;
}

export interface SleepLogData {
    sleepHours: number;
    sleepNotes: string;
}

export interface NutritionData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    nutritionNotes: string;
}

export interface WorkoutLogData {
    workoutName: string;
    workoutDuration: number;
    workoutVolume: number;
    personalRecords: number;
    workoutNotes: string;
}

// >>> RESPONSES <<<
export interface DailyLogResponse extends DailyLogData {
    id: number;
}

// >>> REQUESTS <<<
export type CreateDailyLogRequest = DailyLogData;
export type UpdateDailyLogRequest = DailyLogData;