import type { UtcDateRange } from "../ui/screens/MyDay";

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

export function isFuture(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const check = new Date(date);
    check.setHours(0, 0, 0, 0);

    return check > today;
}

export function isToday(date: Date): boolean {
    const today = new Date();

    return isSameDay(date, today);
}

export function isSameDay(dateA: Date, dateB: Date) {
    return (
        dateA.getFullYear() === dateB.getFullYear() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getDate() === dateB.getDate()
    );
}