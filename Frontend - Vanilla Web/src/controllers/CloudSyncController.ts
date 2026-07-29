import * as api from "../api/API";
import { ToDateKey, type DateKey } from "../data-store/DateKey";
import { MetricTypeIdsArray } from "../models/MetricRegistry";
import * as Auth from "./AuthController";

import * as MetricRepositoryController from "./MetricRepositoryController";

export function isAvailable() {
    return Auth.isLoggedIn();
}

export async function sync(date: Date): Promise<boolean> {
    const dateKey = ToDateKey(date);

    try {
        await uploadMetrics(dateKey);
        MetricRepositoryController.metricRepository.clearPendingChanges(dateKey);
        await downloadMetrics(dateKey);

        return true;
    } catch (e) {
        console.log("Cloud sync failed", e);
        return false;
    }
}

async function downloadMetrics(dateKey: DateKey) {
    const allMetrics = await api.getMetrics(dateKey);

    if (!allMetrics) return;

    for (const id of MetricTypeIdsArray) {
        const value = allMetrics[id];

        if (value !== undefined) {
            MetricRepositoryController.metricRepository.setCloudMetric(dateKey, id, value);
        }
    }
}

async function uploadMetrics(dateKey: DateKey) {
    await Promise.all(
        MetricTypeIdsArray.map(async id => {
            const value = MetricRepositoryController.metricRepository.getMetricToUpload(dateKey, id);

            if (value !== undefined) {
                await api.setMetric(dateKey, id, value);
            }
        })
    );
}