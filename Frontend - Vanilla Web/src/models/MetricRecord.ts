import type { MetricTypeId } from "./MetricTypeIds";


export class MetricRecord<T> {
    public readonly metricTypeId: MetricTypeId;
    public readonly metricData: T;

    constructor(metricTypeId: MetricTypeId, metricData: T) {
        this.metricTypeId = metricTypeId;
        this.metricData = metricData;
    }
}
