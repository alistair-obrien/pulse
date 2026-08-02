import type { DateKey } from "../data-store/DateKey";
import { MetricRecordStore } from "../data-store/MetricRecordStore";
import {
    metricsRegistry,
    type MetricTypeId,
    type MetricTypes
} from "../models/MetricRegistry";

const ENV = import.meta.env.VITE_ENVIRONMENT;

const storagePrefix = (() => {
    switch (ENV) {
        case "Development":
            return "pulse_dev";
        case "Production":
            return "pulse";
        case "LocalHost":
            return "pulse_local";
        default:
            throw new Error(`Unknown environment: ${ENV}`);
    }
})();

class MetricRepositoryController {
    private readonly userEditsStore = new MetricRecordStore(`${storagePrefix}:user:`);
    private readonly deviceCacheStore = new MetricRecordStore(`${storagePrefix}:device:`);
    private readonly cloudCacheStore = new MetricRecordStore(`${storagePrefix}:cloud:`);

    constructor() {
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);

        this.userEditsStore.Preload(oneWeekAgo, today);
        this.deviceCacheStore.Preload(oneWeekAgo, today);
        this.cloudCacheStore.Preload(oneWeekAgo, today);
    }

    resolveMetric<K extends MetricTypeId>(
        date: DateKey,
        id: K
    ): MetricTypes[K] {
        const defaultValue = metricsRegistry[id].defaultValue as MetricTypes[K];
        return sanitizeMetric(
            this.userEditsStore.Get(date, id)?.metricData
                ?? this.deviceCacheStore.Get(date, id)?.metricData
                ?? this.cloudCacheStore.Get(date, id)?.metricData,
            defaultValue
        );
    }

    resolveMetrics<const T extends readonly MetricTypeId[]>(
        date: DateKey,
        ...ids: T
    ): {
        [K in T[number]]: MetricTypes[K];
    } {
        const result = {} as {
            [K in T[number]]: MetricTypes[K];
        };

        for (const id of ids as readonly T[number][]) {
            result[id] = this.resolveMetric(date, id);
        }

        return result;
    }

    setMetric<K extends MetricTypeId>(
        date: DateKey,
        id: K,
        value: MetricTypes[K]
    ) {
        this.userEditsStore.Set(date, id, value);
    }

    getMetricToUpload<K extends MetricTypeId>(
        date: DateKey,
        id: K
    ): MetricTypes[K] | undefined {
        return this.userEditsStore.Get(date, id)?.metricData
            ?? this.deviceCacheStore.Get(date, id)?.metricData;
    }

    setCloudMetric<K extends MetricTypeId>(
        date: DateKey,
        id: K,
        value: MetricTypes[K]
    ) {
        this.cloudCacheStore.Set(date, id, value);
    }

    setDeviceMetric<K extends MetricTypeId>(
        date: DateKey,
        id: K,
        value: MetricTypes[K]
    ) {
        this.deviceCacheStore.Set(date, id, value);
    }

    clearPendingChanges(date: DateKey) {
        this.userEditsStore.Clear(date);
    }
}

export const metricRepository = new MetricRepositoryController();

function sanitizeMetric<T>(value: unknown, defaultValue: T): T {
    if (value == null)
        return defaultValue;

    if (Array.isArray(defaultValue))
        return Array.isArray(value) ? value as T : defaultValue;

    if (typeof defaultValue === "object")
        return typeof value === "object" && value !== null
            ? value as T
            : defaultValue;

    return typeof value === typeof defaultValue
        ? value as T
        : defaultValue;
}