import { type WorkoutType, WorkoutTypes } from "../../models/WorkoutLogData";
import { ICONS } from "./ICONS";

// =====================================================
// Workout
// =====================================================

export const WORKOUT_ICONS: Record<WorkoutType, string> = {
    [WorkoutTypes.Strength]: ICONS.Strength,
    [WorkoutTypes.Cardio]: ICONS.Cardio,
    [WorkoutTypes.Sports]: ICONS.Sports,
    [WorkoutTypes.HIIT]: ICONS.HIIT,
    [WorkoutTypes.FlexibilityMobility]: ICONS.FlexibilityMobility,
};
