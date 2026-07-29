import { isSameDay } from "../controllers/DateTime";
import type { WorkoutLogData, WorkoutType } from "../models/Models";
import { ToDateKey } from "../models/DateKey";
import { MetricTypeIds } from "../models/MetricRegistry";
import { metricRepository } from "../models/MetricRepository";

const HEVY_API_KEY = "hevy-api-key";

export function getAPIKey(): string {
    return localStorage.getItem(HEVY_API_KEY) ?? "";
}

export function setAPIKey(value: string): void {
    localStorage.setItem(HEVY_API_KEY, value);
}

export async function sync(date: Date): Promise<void> {

    const since = date.toISOString();

    let page = 1;
    const workoutLogs: WorkoutLogData[] = [];

    while (true) {

        const response = await fetch(
            `https://api.hevyapp.com/v1/workouts/events?page=${page}&pageSize=10&since=${encodeURIComponent(since)}`,
            {
                headers: {
                    "api-key": getAPIKey()
                }
            }
        );

        if (!response.ok)
            throw new Error("Failed to fetch Hevy workouts.");

        const json = await response.json();

        console.log(json);
        if (json.events == null) {
            break;
        }

        for (const event of json.events) {

            // Ignore deleted workouts
            if (event.type === "deleted")
                continue;

            const workout = event.workout;

            // Only workouts that START on the requested day
            if (!isSameDay(new Date(workout.start_time), date))
                continue;

            workoutLogs.push(...convertWorkout(workout));
        }

        if (page >= json.page_count)
            break;

        page++;
    }

    metricRepository.deviceCacheStore.Set(
        ToDateKey(date),
        MetricTypeIds.Workouts,
        workoutLogs
    );
}

function convertWorkout(workout: HevyWorkout): WorkoutLogData[] {

    const totalMinutes =
        (new Date(workout.end_time).getTime() -
         new Date(workout.start_time).getTime()) / 60000;

    let explicitMinutes = 0;
    let untimedExerciseCount = 0;

    const minutesByType = new Map<WorkoutType, number>();

    for (const exercise of workout.exercises) {

        const type = getWorkoutType(exercise);

        const exerciseMinutes = exercise.sets.reduce(
            (sum, set) => sum + ((set.duration_seconds ?? 0) / 60),
            0
        );

        if (exerciseMinutes > 0) {

            explicitMinutes += exerciseMinutes;

            minutesByType.set(
                type,
                (minutesByType.get(type) ?? 0) + exerciseMinutes
            );
        }
        else {

            untimedExerciseCount++;
        }
    }

    const remainingMinutes = Math.max(0, totalMinutes - explicitMinutes);
    const minutesPerUntimed =
        untimedExerciseCount > 0
            ? remainingMinutes / untimedExerciseCount
            : 0;

    for (const exercise of workout.exercises) {

        const exerciseMinutes = exercise.sets.reduce(
            (sum, set) => sum + ((set.duration_seconds ?? 0) / 60),
            0
        );

        if (exerciseMinutes > 0)
            continue;

        const type = getWorkoutType(exercise);

        minutesByType.set(
            type,
            (minutesByType.get(type) ?? 0) + minutesPerUntimed
        );
    }

    return [...minutesByType.entries()].map(([type, minutes]) => ({
        workoutName: workout.title,
        workoutType: type,
        workoutDuration: Math.round(minutes),
        workoutNotes: workout.description ?? ""
    }));
}

function getWorkoutType(exercise: HevyExercise): WorkoutType {

    const title = exercise.title.toLowerCase();

    if (title.includes("basketball") ||
        title.includes("soccer") ||
        title.includes("football") ||
        title.includes("tennis"))
        return "Sports";

    if (title.includes("walking") ||
        title.includes("running") ||
        title.includes("cycling") ||
        title.includes("swimming") ||
        title.includes("rowing"))
        return "Cardio";

    if (title.includes("burpee") ||
        title.includes("kettlebell") ||
        title.includes("sled"))
        return "HIIT";

    if (title.includes("yoga") ||
        title.includes("pilates") ||
        title.includes("stretch"))
        return "Flexibility/Mobility";

    return "Strength Training";
}

export interface HevyResponse {
    page: number;
    page_count: number;
    events: HevyEvent[];
}

export type HevyEvent = HevyUpdatedEvent | HevyDeletedEvent;

export interface HevyUpdatedEvent {
    type: "updated";
    workout: HevyWorkout;
}

export interface HevyDeletedEvent {
    type: "deleted";
    id: string;
    deleted_at: string;
}

export interface HevyWorkout {
    id: string;
    title: string;
    routine_id: string | null;
    description: string;
    start_time: string;
    end_time: string;
    updated_at: string;
    created_at: string;
    exercises: HevyExercise[];
}

export interface HevyExercise {
    index: number;
    title: string;
    notes: string;
    exercise_template_id: string;
    supersets_id: number | null;
    sets: HevySet[];
}

export interface HevySet {
    index: number;
    type: string;
    weight_kg: number | null;
    reps: number | null;
    distance_meters: number | null;
    duration_seconds: number | null;
    rpe: number | null;
    custom_metric: number | null;
}