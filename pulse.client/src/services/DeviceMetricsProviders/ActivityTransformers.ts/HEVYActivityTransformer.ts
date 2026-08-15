import type {
    ActivityLogData,
    ActivityType
} from "../../../models/ActivityLogData";

interface HEVYActivityInfo {
    type: ActivityType;
    standalone: boolean;
}

export function transformHEVYActivity(
    activity: ActivityLogData
): ActivityLogData[] {

    const lines = activity.notes.split("\n");

    const activities: ActivityLogData[] = [];

    let currentTitle: string | null = null;
    let currentType: ActivityType | null = null;
    let currentStandalone = false;

    let timedDuration = 0;
    let hasStrengthTraining = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            continue;
        }

        // Metadata
        if (
            trimmed === activity.title ||
            trimmed.startsWith("@") ||
            trimmed.startsWith("http") ||
            isHEVYDateLine(trimmed)
        ) {
            continue;
        }

        // Exercise/activity title
        if (!trimmed.startsWith("Set ")) {
            currentTitle = trimmed;

            const info = getActivityInfo(trimmed);

            currentType = info.type;
            currentStandalone = info.standalone;

            continue;
        }

        // Set
        const duration = parseDuration(trimmed);

        if (duration !== null) {
            if (currentTitle && currentType) {
                const existing = activities.find(
                    x => x.title === currentTitle
                );

                if (existing) {
                    existing.duration += duration;
                } else {
                    activities.push({
                        title: currentTitle,
                        type: currentType,
                        duration,
                        notes: "",
                        source: activity.source
                    });
                }

                if (currentStandalone) {
                    timedDuration += duration;
                } else {
                    hasStrengthTraining = true;
                }
            }

            continue;
        }

        // A non-timed set means this workout contains
        // strength-training time.
        hasStrengthTraining = true;
    }

    // Anything left over from the original workout duration
    // is considered strength training.
    if (hasStrengthTraining) {
        const strengthDuration =
            Math.max(0, activity.duration - timedDuration);

        if (strengthDuration > 0) {
            activities.push({
                title: "Strength Training",
                type: "strengthTraining",
                duration: strengthDuration,
                notes: "",
                source: activity.source
            });
        }
    }

    return activities;
}

function parseDuration(line: string): number | null {
    const hours = line.match(/(\d+)h/)?.[1];
    const minutes = line.match(/(\d+)min/)?.[1];
    const seconds = line.match(/(\d+)s/)?.[1];

    if (
        hours === undefined &&
        minutes === undefined &&
        seconds === undefined
    ) {
        return null;
    }

    return (
        (hours ? Number(hours) * 60 : 0) +
        (minutes ? Number(minutes) : 0) +
        (seconds ? Number(seconds) / 60 : 0)
    );
}

function isHEVYDateLine(line: string): boolean {
    return (
        line.includes(", ") &&
        line.includes(" at ")
    );
}

const cardio: ActivityType[] = [
    "walking",
    "hiking",
];

function getActivityInfo(title: string): HEVYActivityInfo {
    const normalizedTitle = title.toLowerCase();

    if (cardio.includes(normalizedTitle as ActivityType)) {
        return {
            type: normalizedTitle as ActivityType,
            standalone: true
        };
    }

    return {
        type: "strengthTraining",
        standalone: false
    };
}