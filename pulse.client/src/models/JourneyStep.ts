import { metricsRegistry, type MetricTypeId, type MetricTypes } from "./MetricRegistry";

export class JourneyStep {
    id:number = -1;
    userId = "";
    published = false;
    date = ""; // 2026-07-12
    userName = "";
    userProfilePicture = "";
    liked = false;
    likesCount = 0;
    comments: Comment[] = [];

    metrics: Partial<MetricTypes> = {};

    getMetric<K extends MetricTypeId>(id: K): MetricTypes[K] {
        return this.metrics[id] ?? (metricsRegistry[id].defaultValue as MetricTypes[K]);
    }

    static fromJson(data: any): JourneyStep {
        const step = new JourneyStep();

        step.id = data.id;
        step.userId = data.userId;
        step.published = data.published;
        step.date = data.date;
        step.userName = data.userName;
        step.userProfilePicture = data.userProfilePicture;
        step.liked = data.liked;
        step.likesCount = data.likesCount;
        step.comments = data.comments ?? [];

        if (data.metrics) {
            // Already normalized (local)
            step.metrics = data.metrics;
        } else if (data.metricData) {
            // Server format
            step.metrics = {};

            for (const metric of data.metricData) {
                (step.metrics as any)[metric.metricTypeId] = metric.value;
            }
        }

        return step;
    }
}