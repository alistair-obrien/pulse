import { MetricTypeIdsArray } from "../models/MetricRegistry";

import * as DateUtils from "../utils/DateUtils";

// Controllers
import type { AuthService } from "./AuthService";
import type { API } from "../api/API";
import type { UserSession } from "../UserSession";

export class CloudMetricsSyncService {

    private readonly userSession:UserSession;
    private readonly authService:AuthService;
    private readonly api:API;

    constructor(userSession:UserSession, authService:AuthService, api:API) {
        this.userSession = userSession;
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
            this.userSession.metrics.clearPendingChanges(dateKey);
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
                this.userSession.metrics.setCloudMetric(dateKey, id, value);
            }
        }
    }

    private async uploadMetrics(dateKey: DateUtils.DateKey) {
        await Promise.all(
            MetricTypeIdsArray.map(async id => {
                const value = this.userSession.metrics.getMetricToUpload(dateKey, id);

                if (value !== undefined) {
                    await this.api.setMetric(dateKey, id, value);
                }
            })
        );
    }
}