import { MetricRecord } from "./MetricRecord";
import { ToDateKey, type DateKey } from "./DateKey";
import type { MetricTypeId } from "./MetricTypeIds";


export class MetricRecordStore {

    private readonly storagePrefix: string;

    constructor(storagePrefix: string) {
        this.storagePrefix = storagePrefix;
    }

    private loadedDates = new Set<DateKey>();
    private metricRecordsByDate: Record<DateKey, Record<MetricTypeId, MetricRecord<any>>> = {};

    private EnsureLoaded(dateKey: DateKey) {

        if (this.loadedDates.has(dateKey))
            return;

        this.LoadDate(dateKey);
        this.loadedDates.add(dateKey);
    }

    Preload(start: Date, end: Date) {

        if (start > end)
            [start, end] = [end, start];

        for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const key = ToDateKey(d);
            this.EnsureLoaded(key);
        }
    }

    private LoadDate(date: DateKey) {

        const json = localStorage.getItem(this.storagePrefix + date);

        if (!json)
            return;

        this.metricRecordsByDate[date] = JSON.parse(json);
    }

    Get<T>(dateKey: DateKey, metricTypeId: MetricTypeId): MetricRecord<T> | undefined {
        this.EnsureLoaded(dateKey);
        return this.metricRecordsByDate[dateKey]?.[metricTypeId] as MetricRecord<T> | undefined;
    }

    Set(dateKey: DateKey, metricTypeId: MetricTypeId, data: any) {

        console.log(`${this.storagePrefix} - Set`, dateKey, metricTypeId, data);
        
        const record = new MetricRecord(metricTypeId, data);

        this.EnsureLoaded(dateKey);
        this.metricRecordsByDate[dateKey] ??= {};
        this.metricRecordsByDate[dateKey][metricTypeId] = record;
        this.SaveDate(dateKey);
    }

    Remove(dateKey: DateKey, metricTypeId: MetricTypeId) {
        this.EnsureLoaded(dateKey);
        const day = this.metricRecordsByDate[dateKey];
        if (!day)
            return;

        delete day[metricTypeId];

        // Clean up empty dates
        if (Object.keys(day).length === 0)
            delete this.metricRecordsByDate[dateKey];

        this.SaveDate(dateKey);
    }

    private SaveDate(date: DateKey) {
        const metrics = this.metricRecordsByDate[date];

        if (!metrics) {
            localStorage.removeItem(this.storagePrefix + date);
            return;
        }

        localStorage.setItem(
            this.storagePrefix + date,
            JSON.stringify(metrics)
        );
    }

    Clear(dateKey:DateKey) {

        console.log("CLEAR ", dateKey);

        this.loadedDates.delete(dateKey);
        delete this.metricRecordsByDate[dateKey];

        this.SaveDate(dateKey);
    }
}
