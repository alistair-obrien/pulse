
// >>> DATA <<<
export interface SleepLogData {
    sleepHours: number;
    sleepNotes: string;
}

export interface WorkoutLogData {
    workoutName: string;
    workoutDuration: number;
    workoutVolume: number;
    personalRecords: number;
    workoutNotes: string;
}

// // >>> RESPONSES <<<
// export interface DailyLogResponse extends DailyLogData {
//     id: number;
// }

// // >>> REQUESTS <<<
// export type CreateDailyLogRequest = DailyLogData;
// export type UpdateDailyLogRequest = DailyLogData;