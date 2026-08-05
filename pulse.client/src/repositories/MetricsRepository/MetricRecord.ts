import type { MetricTypeId, MetricTypes } from "../../models/MetricRegistry";


export class MetricRecord<K extends MetricTypeId> {
    public readonly metricTypeId: K;
    public readonly metricData: MetricTypes[K];

    constructor(
        metricTypeId: K,
        metricData: MetricTypes[K]
    ) {
        this.metricTypeId = metricTypeId;
        this.metricData = metricData;
    }
}