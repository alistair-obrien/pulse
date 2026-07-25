import type { UtcDateRange } from "./Report";

/**
 * Returns the UTC range covering exactly one local calendar day.
 */

export function getLocalDayUtcRange(date = new Date()): UtcDateRange {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return {
        startUtc: start.toISOString(),
        endUtc: end.toISOString(),
    };
}
