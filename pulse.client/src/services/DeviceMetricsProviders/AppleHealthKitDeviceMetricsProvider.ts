import type { UserSession } from "../../UserSession";
import type { DeviceMetricsSyncService } from "../DeviceMetricsSyncService";

export class HealthKitSyncService implements DeviceMetricsSyncService {
    
    private userSession:UserSession;

    constructor(userSession: UserSession) {
        this.userSession = userSession;
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