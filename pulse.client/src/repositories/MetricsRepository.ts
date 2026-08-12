import { MetricRecordStore } from "./MetricsRepository/MetricRecordStore";
import {
    metricsRegistry,
    type MetricTypeId,
    type MetricTypes
} from "../models/MetricRegistry";
import type { DateKey } from "../utils/DateUtils";
import type { AppConfig } from "../AppConfig";

export class MetricsRepository {

    private readonly storagePrefix:string; 
 
    private readonly userEditsStore:MetricRecordStore;
    private readonly deviceCacheStore:MetricRecordStore;
    private readonly cloudCacheStore:MetricRecordStore;

    constructor(appConfig:AppConfig, prefix:string) {
        this.storagePrefix = `pulse_${appConfig.environment}:${prefix}`

        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);

        this.userEditsStore = new MetricRecordStore(`${this.storagePrefix}:user:`);
        this.deviceCacheStore = new MetricRecordStore(`${this.storagePrefix}:device:`);
        this.cloudCacheStore = new MetricRecordStore(`${this.storagePrefix}:cloud:`);

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

    setUserEditMetric<K extends MetricTypeId>(
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