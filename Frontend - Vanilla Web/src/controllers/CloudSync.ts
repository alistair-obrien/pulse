import * as api from "../api/API";
import { ToDateKey, type DateKey } from "../models/DateKey";
import { metricRepository } from "../models/MetricRepository";
import { metricsRegistry } from "../models/MetricRegistry";
import * as Auth from "../api/Auth"

export function isAvailable() {
    return Auth.isLoggedIn();
}
export async function sync(date: Date) : Promise<boolean> {
    let dateKey = ToDateKey(date);

    try {
        await uploadMetrics(dateKey);
        metricRepository.userEditsStore.Clear(dateKey); // Clear user edits
        await downloadMetrics(dateKey);

        return true;
    } catch (e) {
        console.log("Cloud sync failed", e);
        return false;
    }
}

async function downloadMetrics(dateKey: DateKey) {

    const allMetrics = await api.getMetrics(dateKey);

    if (!allMetrics)
        return;

    for (const metric of metricsRegistry) {
        metricRepository.setCloudMetric(
            dateKey,
            metric.id,
            allMetrics[metric.id]
        );
    }
}

async function uploadMetrics(dateKey: DateKey) {

    await Promise.all(
        metricsRegistry.map(async metric => {

            const value = metricRepository.getMetricToUpload(dateKey, metric.id);

            if (value !== undefined)
                await api.setMetric(dateKey, metric.id, value);
        })
    );
}


