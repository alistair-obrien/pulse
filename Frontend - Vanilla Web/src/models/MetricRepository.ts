import { MetricRecordStore } from "./MetricRecordStore";
import type { DateKey } from "./DateKey";
import type { MetricTypeId } from "./MetricTypeIds";


class MetricRepository {

    readonly userEditsStore: MetricRecordStore = new MetricRecordStore("pulse:user:");
    readonly deviceCacheStore: MetricRecordStore = new MetricRecordStore("pulse:device:");
    readonly cloudCacheStore: MetricRecordStore = new MetricRecordStore("pulse:cloud:");

    constructor() {
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);

        this.userEditsStore.Preload(oneWeekAgo, today);
        this.deviceCacheStore.Preload(oneWeekAgo, today);
        this.cloudCacheStore.Preload(oneWeekAgo, today);
    }

    resolveMetric<T>(
        date: DateKey,
        metricTypeId: MetricTypeId,
        defaultValue: T
    ): T {

        const value =
            this.userEditsStore.Get(date, metricTypeId)?.metricData
            ?? this.deviceCacheStore.Get(date, metricTypeId)?.metricData
            ?? this.cloudCacheStore.Get(date, metricTypeId)?.metricData;

        return sanitizeMetric(value, defaultValue);
    }
}

export const metricRepository:MetricRepository = new MetricRepository();

function sanitizeMetric<T>(value: unknown, defaultValue: T): T {

    if (value == null)
        return defaultValue;

    // Wrong primitive type
    if (typeof defaultValue !== "object" &&
        typeof value !== typeof defaultValue)
        return defaultValue;

    // Expected an array
    if (Array.isArray(defaultValue))
        return Array.isArray(value) ? value as T : defaultValue;

    return value as T;
}