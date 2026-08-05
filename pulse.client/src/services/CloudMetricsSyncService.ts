import { MetricTypeIdsArray } from "../models/MetricRegistry";

import * as DateUtils from "../utils/DateUtils";

// Controllers
import type { MetricsRepository } from "../repositories/MetricsRepository";
import type { AuthService } from "./AuthService";
import type { API } from "../api/API";

export class CloudMetricsSyncService {

    private readonly metricsRepository:MetricsRepository;
    private readonly authService:AuthService;
    private readonly api:API;

    constructor(metricsRepository:MetricsRepository, authService:AuthService, api:API) {
        this.metricsRepository = metricsRepository;
        this.authService = authService;
        this.api = api;
    }

    isAvailable() {
        return this.authService.isLoggedIn();
    }

    async sync(date: Date): Promise<boolean> {
        const dateKey = DateUtils.toDateKey(date);

        try {
            await this.uploadMetrics(dateKey);
            this.metricsRepository.clearPendingChanges(dateKey);
            await this.downloadMetrics(dateKey);

            return true;
        } catch (e) {
            console.log("Cloud sync failed", e);
            return false;
        }
    }

    private async downloadMetrics(dateKey: DateUtils.DateKey) {
        const allMetrics = await this.api.getMetrics(dateKey);

        if (!allMetrics) return;

        for (const id of MetricTypeIdsArray) {
            const value = allMetrics[id];

            if (value !== undefined) {
                this.metricsRepository.setCloudMetric(dateKey, id, value);
            }
        }
    }

    private async uploadMetrics(dateKey: DateUtils.DateKey) {
        await Promise.all(
            MetricTypeIdsArray.map(async id => {
                const value = this.metricsRepository.getMetricToUpload(dateKey, id);

                if (value !== undefined) {
                    await this.api.setMetric(dateKey, id, value);
                }
            })
        );
    }
}