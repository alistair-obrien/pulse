import type { MetricTypeId } from "./MetricRegistry";


export class MetricRecord<T> {
    public readonly metricTypeId: MetricTypeId;
    public readonly metricData: T;

    constructor(metricTypeId: MetricTypeId, metricData: T) {
        this.metricTypeId = metricTypeId;
        this.metricData = metricData;
    }
}
