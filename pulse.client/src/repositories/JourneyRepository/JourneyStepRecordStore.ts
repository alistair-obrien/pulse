import { toDateKey, type DateKey } from "../../utils/DateUtils";
import { DataStore } from "../DataStore";
import type { JourneyStepRecord } from "./JourneyStepRecord";

export class JourneyStepRecordStore extends DataStore {

    private loadedDates = new Set<DateKey>();

    private recordsByDate: Record<
        DateKey,
        JourneyStepRecord | undefined
    > = {};

    private ensureLoaded(dateKey: DateKey) {

        if (this.loadedDates.has(dateKey))
            return;

        this.loadDate(dateKey);
        this.loadedDates.add(dateKey);
    }

    private loadDate(dateKey: DateKey) {

        const json = localStorage.getItem(
            this.storagePrefix + dateKey
        );

        if (!json)
            return;

        this.recordsByDate[dateKey] = JSON.parse(json);
    }

    get(date: Date): JourneyStepRecord | undefined {

        const dateKey = toDateKey(date);

        this.ensureLoaded(dateKey);

        return this.recordsByDate[dateKey];
    }

    getRange(
        start: Date,
        end: Date
    ): JourneyStepRecord[] {

        if (start > end)
            [start, end] = [end, start];

        const records: JourneyStepRecord[] = [];

        for (
            const date = new Date(start);
            date <= end;
            date.setDate(date.getDate() + 1)
        ) {
            const dateKey = toDateKey(date);

            this.ensureLoaded(dateKey);

            const record = this.recordsByDate[dateKey];

            if (record)
                records.push(record);
        }

        return records;
    }

    set(record: JourneyStepRecord) {

        const dateKey = toDateKey(record.date);

        this.ensureLoaded(dateKey);

        this.recordsByDate[dateKey] = record;

        this.saveDate(dateKey);
    }

    remove(date: Date) {

        const dateKey = toDateKey(date);

        this.ensureLoaded(dateKey);

        delete this.recordsByDate[dateKey];

        this.saveDate(dateKey);
    }

    clear() {

        for (const dateKey of this.loadedDates) {
            delete this.recordsByDate[dateKey];
            this.saveDate(dateKey);
        }

        this.loadedDates.clear();
    }

    private saveDate(dateKey: DateKey) {

        const record = this.recordsByDate[dateKey];

        if (!record) {
            localStorage.removeItem(
                this.storagePrefix + dateKey
            );

            return;
        }

        localStorage.setItem(
            this.storagePrefix + dateKey,
            JSON.stringify(record)
        );
    }
}