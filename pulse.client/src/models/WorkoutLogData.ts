export const WorkoutTypes = {
    Strength: "Strength Training",
    Cardio: "Cardio",
    HIIT: "HIIT",
    Sports: "Sports",
    FlexibilityMobility: "Flexibility/Mobility",
} as const;

export type WorkoutType =
    typeof WorkoutTypes[keyof typeof WorkoutTypes];

export interface WorkoutLogData {
    workoutName: string;
    workoutType: WorkoutType;
    workoutDuration: number;
    workoutNotes: string;
}