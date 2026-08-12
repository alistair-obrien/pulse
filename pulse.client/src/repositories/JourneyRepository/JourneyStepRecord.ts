import type { MetricTypes } from "../../models/MetricRegistry";

export class JourneyStepRecord {
    public readonly date: Date;
    public readonly metrics: Partial<MetricTypes>

    constructor(
        date: Date,
        metrics: Partial<MetricTypes>
    ) {
        this.date = date;
        this.metrics = metrics;
    }
}