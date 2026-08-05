import type { MetricsRepository } from "../../repositories/MetricsRepository";
import type { DeviceMetricsSyncService } from "../DeviceMetricsSyncService";

export class HealthKitSyncService implements DeviceMetricsSyncService {
    
    private metricsRepositoryController:MetricsRepository;

    constructor(metricsRepository: MetricsRepository) {
        this.metricsRepositoryController = metricsRepository;
    }

    async initialize(): Promise<void> {
        console.log("Health Kit not yet implemented.");
    }
    
    async isAvailable(): Promise<boolean> {
        return false;
    }
    
    async sync(date: Date): Promise<void> {
        console.log("Health Kit not yet implemented.");
        void date;
    }
}