import type { DateKey } from "./DateKey";
import { MetricRecordStore } from "./MetricRecordStore";
import { metricsRegistry, type MetricTypeId } from "./MetricRegistry";
const ENV = import.meta.env.VITE_ENVIRONMENT;

const storagePrefix = (() => {
    switch (ENV) {
        case "Development":
            return "pulse_dev";
        case "Production":
            return "pulse";
        case "Local":
            return "pulse_local";
        default:
            throw new Error(`Unknown environment: ${ENV}`);
    }
})();

class MetricRepository {

    readonly userEditsStore = new MetricRecordStore(`${storagePrefix}:user:`);
    readonly deviceCacheStore = new MetricRecordStore(`${storagePrefix}:device:`);
    readonly cloudCacheStore = new MetricRecordStore(`${storagePrefix}:cloud:`);

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
        metricTypeId: MetricTypeId
    ): T {

        const definition = metricsRegistry.find(m => m.id === metricTypeId)!;

        return sanitizeMetric(
            this.userEditsStore.Get<T>(date, metricTypeId)?.metricData
            ?? this.deviceCacheStore.Get<T>(date, metricTypeId)?.metricData
            ?? this.cloudCacheStore.Get<T>(date, metricTypeId)?.metricData,
            definition.defaultValue as T
        );
    }

    getMetricToUpload(
        date: DateKey,
        metricTypeId: MetricTypeId
    ): unknown {

        return this.userEditsStore.Get(date, metricTypeId)?.metricData
            ?? this.deviceCacheStore.Get(date, metricTypeId)?.metricData;
    }

    setCloudMetric(
        date: DateKey,
        metricTypeId: MetricTypeId,
        value: unknown
    ) {
        if (value !== undefined && value !== null)
            this.cloudCacheStore.Set(date, metricTypeId, value);
    }

    clearPendingChanges(date: DateKey) {
        this.userEditsStore.Clear(date);
    }
}

export const metricRepository:MetricRepository = new MetricRepository();

function sanitizeMetric<T>(value: unknown, defaultValue: T): T {

    if (value == null)
        return defaultValue;

    // Arrays
    if (Array.isArray(defaultValue))
        return Array.isArray(value) ? value as T : defaultValue;

    // Objects (excluding arrays/null)
    if (typeof defaultValue === "object")
        return typeof value === "object" && value !== null
            ? value as T
            : defaultValue;

    // Primitive types
    return typeof value === typeof defaultValue
        ? value as T
        : defaultValue;
}