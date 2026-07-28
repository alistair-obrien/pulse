import type { DateKey } from "../models/DateKey";
import type { MetricTypeId } from "../models/MetricRegistry";
import { get, post, put } from "./client";

export function publish(dateKey:DateKey): Promise<boolean> {
    return post(`/api/dailylogs/${dateKey}/publish`);
}

export function getMetric<T>(dateKey:DateKey, metricTypeId:MetricTypeId): Promise<T | null> {
    return get(`/api/metrics/${dateKey}/${metricTypeId}`);
}

export function setMetric<T>(dateKey:DateKey, metricTypeId:MetricTypeId, value:T): Promise<boolean> {
    return put(`/api/metrics/${dateKey}/${metricTypeId}`, { metricData: value });
}

// export function getMetrics<T>(dateKey:DateKey): Promise<T | null> {
//     return get(`/api/metrics/metrics/${dateKey}`);
// }

export function getMetrics(
    dateKey: DateKey
): Promise<Partial<Record<MetricTypeId, unknown>> | null> {
    return get(`/api/metrics/${dateKey}`);
}