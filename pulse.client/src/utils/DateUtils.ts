export type DateKey = string; // "2026-07-25"

export interface UtcDateRange {
    startUtc: string;
    endUtc: string;
}

export function toDateKey(date: Date): DateKey {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Returns the UTC range covering exactly one local calendar day.
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

//01:51:00
//13.933333333333334
// -> 3h 14m
export function getHoursAndMinutesStrFromTime(time: number | string): string {

    let hours: number;
    let minutes: number;

    if (typeof time === "number") {
        hours = Math.floor(time);
        minutes = Math.round((time - hours) * 60);
    } else {
        const [h, m] = time.split(":").map(Number);
        hours = h;
        minutes = m;
    }

    return `${hours}h ${minutes}m`;
}