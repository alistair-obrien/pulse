import { type ActivityType, ActivityTypes } from "../../models/ActivityLogData";
import { ICONS } from "./ICONS";

// =====================================================
// Workout
// =====================================================

export const WORKOUT_ICONS: Record<ActivityType, string> = {
    [ActivityTypes.Strength]: ICONS.Strength,
    [ActivityTypes.Cardio]: ICONS.Cardio,
    [ActivityTypes.Sports]: ICONS.Sports,
    [ActivityTypes.HIIT]: ICONS.HIIT,
    [ActivityTypes.FlexibilityMobility]: ICONS.FlexibilityMobility,
};
