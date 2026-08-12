import { registerPlugin } from "@capacitor/core";
import { MetricTypeIds } from "../../models/MetricRegistry";
import type { SleepLogData } from "../../models/SleepLogData";
import { getLocalDayUtcRange, toDateKey } from "../../utils/DateUtils";

// Services
import type { DeviceMetricsSyncService } from "../DeviceMetricsSyncService";

// Controllers
import type { MetricsRepository } from "../../repositories/MetricsRepository";
import type { UserSession } from "../../UserSession";

interface HealthConnectPlugin {
    isAvailable() : Promise<AvailabilityResult>;

    hasHealthConnectPermissions() : Promise<HasHealthConnectPermissionsResult>;
    
    requestHealthConnectPermissions() : Promise<{}>;

    openHealthConnectSettings() : Promise<void>;

    readSteps(options:ReadStepsOptions) : Promise<ReadStepsResult>;

    readSleep(options:ReadSleepOptions) : Promise<ReadSleepResult>;

    readNutrition(options:ReadNutritionOptions) : Promise<ReadNutritionResult>;

    readRestingHeartRate(options:ReadRestingHeartRateOptions) : Promise<ReadRestingHeartRateResult>;

    // readHeartRate(start:Date, end:Date) : Promise<{}>;

    // readSleep(start:Date, end:Date) : Promise<{}>;

    // writeWeight(weight:number) : Promise<{}>;

    // writeExercise(exercise:number) : Promise<{}>;
}

interface AvailabilityResult {
    available: boolean;
    reason: string;
    status: number;
}

interface HasHealthConnectPermissionsResult {
    has_permissions: boolean;
}

// >>> Steps <<<
interface ReadStepsOptions {
    startUtc: string;
    endUtc: string;
}

interface ReadStepsResult {
    totalSteps: number
    // samples: StepSample[];
}

// >>> Sleep <<<
interface ReadSleepOptions {
    startUtc: string;
    endUtc: string;
}

interface ReadSleepResult {
    sessions: SleepSession[]
}

interface SleepSession {
    startTime:string; 
    endTime:string;
    title:string;
    notes:string;
    startZoneOffset: string;
    endZoneOffset: string;
}

// >>> Nutrition <<<
interface ReadNutritionOptions {
    startUtc: string;
    endUtc: string;
}

interface ReadNutritionResult {
    totalCalories: number;
    totalProtein: number;
    totalCarbohydrates: number;
    totalFats: number;
    totalFiber: number;
}

// >>> Resting Heart Rate <<<
interface ReadRestingHeartRateOptions {
    startUtc: string;
    endUtc: string;
}

interface ReadRestingHeartRateResult {
    averageRestingHeartRate: number;
}

// Java Plugin HealthConnectPlugin.java
export const HealthConnect = registerPlugin<HealthConnectPlugin>("HealthConnect");

type HealthConnectData = {
    steps: Awaited<ReturnType<typeof HealthConnect.readSteps>>;
    restingHeartRate: Awaited<ReturnType<typeof HealthConnect.readRestingHeartRate>>;
    sleep: Awaited<ReturnType<typeof HealthConnect.readSleep>>;
    nutrition: Awaited<ReturnType<typeof HealthConnect.readNutrition>>;
};

const IMPORTERS = [
    {
        metric: MetricTypeIds.Steps,
        value: (hc: HealthConnectData) => hc.steps.totalSteps
    },
    {
        metric: MetricTypeIds.RestingHeartRate,
        value: (hc: HealthConnectData) => hc.restingHeartRate.averageRestingHeartRate
    },
    {
        metric: MetricTypeIds.Sleep,
        value: (hc: HealthConnectData): SleepLogData[] =>
            hc.sleep.sessions.map(session => ({
                sleepHours:
                    (new Date(session.endTime).getTime() -
                     new Date(session.startTime).getTime()) /
                    (1000 * 60 * 60),
                sleepNotes: session.notes ?? ""
            }))
    },
    {
        metric: MetricTypeIds.Nutrition_Calories,
        value: (hc: HealthConnectData) => hc.nutrition.totalCalories
    },
    {
        metric: MetricTypeIds.Nutrition_Protein,
        value: (hc: HealthConnectData) => hc.nutrition.totalProtein
    },
    {
        metric: MetricTypeIds.Nutrition_Carbs,
        value: (hc: HealthConnectData) => hc.nutrition.totalCarbohydrates
    },
    {
        metric: MetricTypeIds.Nutrition_Fat,
        value: (hc: HealthConnectData) => hc.nutrition.totalFats
    }
] as const;

export class HealthConnectSyncService implements DeviceMetricsSyncService {
    
    private initialized:boolean = false;
    private _isAvailable:boolean = false;
    private syncing = false;
    
    private readonly userSession:UserSession;

    constructor(userSession: UserSession) {
        this.userSession = userSession;
    }

    async initialize() {
        if (this.initialized)
            return;

        const response = await HealthConnect.isAvailable()
        
        if (response.available) {
            const hasPerms = await HealthConnect.hasHealthConnectPermissions();
            console.log(JSON.stringify(hasPerms));

            if (!hasPerms.has_permissions) {
                await this.openPermissions();
            }

            this._isAvailable = true;
        }

        this.initialized = true;
    }
    
    private async openPermissions() {
        console.log("Requesting permissions...");

        const result = await HealthConnect.requestHealthConnectPermissions();

        console.log(JSON.stringify(result));

        const after = await HealthConnect.hasHealthConnectPermissions();

        console.log(JSON.stringify(after));
    }

    async isAvailable(): Promise<boolean> {

        await this.ensureInitialized();
        return this._isAvailable;
    }
    
    async configure(): Promise<void> {
        await HealthConnect.openHealthConnectSettings();
        // await this.openPermissions();
    }

    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();            
        }
    }

    async sync(date: Date) {

        if (this.syncing) {
            console.log("Health Sync not already syncing.");
            return;
        }

        if (!this._isAvailable) {
            console.log("Health Sync not available on this device.");
            return;
        }

        try {
            this.syncing = true;
            const dateRange = getLocalDayUtcRange(date);
            const dateKey = toDateKey(date);


            console.log("SYNC DATE", date.toString());
            console.log("START UTC", JSON.stringify(dateRange.startUtc));
            console.log("END UTC", JSON.stringify(dateRange.endUtc));

            const [
                steps,
                restingHeartRate,
                sleep,
                nutrition
            ] = await Promise.all([
                HealthConnect.readSteps(dateRange),
                HealthConnect.readRestingHeartRate(dateRange),
                HealthConnect.readSleep(dateRange),
                HealthConnect.readNutrition(dateRange)
            ]);

            const healthData: HealthConnectData = {
                steps,
                restingHeartRate,
                sleep,
                nutrition
            };

            console.log(JSON.stringify(healthData));

            for (const { metric, value } of IMPORTERS) {
                this.userSession.metrics.setDeviceMetric(
                    dateKey,
                    metric,
                    value(healthData)
                );
            }
        }
        catch(e) {
            console.error("Device sync failed", e);
        }
        finally {
            this.syncing = false;
        }
    }
}