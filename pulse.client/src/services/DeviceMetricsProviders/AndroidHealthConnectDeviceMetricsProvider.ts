import { registerPlugin } from "@capacitor/core";
import { MetricTypeIds } from "../../models/MetricRegistry";
import type { SleepLogData } from "../../models/SleepLogData";
import { getLocalDayUtcRange, toDateKey } from "../../utils/DateUtils";

// Services
import type { DeviceMetricsSyncService } from "../DeviceMetricsSyncService";

// Controllers
import type { UserSession } from "../../UserSession";
import type { ActivityLogData } from "../../models/ActivityLogData";

interface HealthConnectPlugin {
    isAvailable(): Promise<AvailabilityResult>;

    hasHealthConnectPermissions(): Promise<HasHealthConnectPermissionsResult>;

    requestHealthConnectPermissions(): Promise<{}>;

    openHealthConnectSettings(): Promise<void>;

    readSteps(options: ReadStepsOptions): Promise<ReadStepsResult>;

    readSleep(options: ReadSleepOptions): Promise<ReadSleepResult>;

    readNutrition(options: ReadNutritionOptions): Promise<ReadNutritionResult>;

    readRestingHeartRate(
        options: ReadRestingHeartRateOptions
    ): Promise<ReadRestingHeartRateResult>;

    readActivities(options: ReadActivityOptions): Promise<ReadActivityResult>;
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
    startUtc: Date;
    endUtc: Date;
}

interface ReadStepsResult {
    totalSteps: number;
}

// >>> Sleep <<<

interface ReadSleepOptions {
    startUtc: Date;
    endUtc: Date;
}

interface ReadSleepResult {
    sessions: SleepSession[];
}

interface SleepSession {
    startTime: string;
    endTime: string;
    title: string;
    notes: string;
    startZoneOffset: string;
    endZoneOffset: string;
}

// >>> Nutrition <<<

interface ReadNutritionOptions {
    startUtc: Date;
    endUtc: Date;
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
    startUtc: Date;
    endUtc: Date;
}

interface ReadRestingHeartRateResult {
    averageRestingHeartRate: number;
}

// >>> Activity <<<

interface ReadActivityOptions {
    startUtc: Date;
    endUtc: Date;
}

interface ReadActivityResult {
    activities: ActivityLogData[];
}

// Java Plugin HealthConnectPlugin.java
export const HealthConnect =
    registerPlugin<HealthConnectPlugin>("HealthConnect");

type HealthConnectData = {
    steps: Awaited<ReturnType<typeof HealthConnect.readSteps>>;
    restingHeartRate: Awaited<
        ReturnType<typeof HealthConnect.readRestingHeartRate>
    >;
    sleep: Awaited<ReturnType<typeof HealthConnect.readSleep>>;
    nutrition: Awaited<ReturnType<typeof HealthConnect.readNutrition>>;
    activities: ActivityLogData[];
};

const IMPORTERS = [
    {
        metric: MetricTypeIds.Steps,
        value: (hc: HealthConnectData) => hc.steps.totalSteps
    },
    {
        metric: MetricTypeIds.RestingHeartRate,
        value: (hc: HealthConnectData) =>
            hc.restingHeartRate.averageRestingHeartRate
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
        value: (hc: HealthConnectData) =>
            hc.nutrition.totalCarbohydrates
    },
    {
        metric: MetricTypeIds.Nutrition_Fat,
        value: (hc: HealthConnectData) => hc.nutrition.totalFats
    },
    // TODO: Aggregate them. ie all walking should be under one activity
    {
        metric: MetricTypeIds.Activities,
        value: (hc: HealthConnectData) => hc.activities
    }
] as const;

export class HealthConnectSyncService
    implements DeviceMetricsSyncService {

    private initialized: boolean = false;
    private _isAvailable: boolean = false;
    private syncing = false;

    private readonly userSession: UserSession;

    constructor(userSession: UserSession) {
        this.userSession = userSession;
    }

    async initialize() {
        if (this.initialized)
            return;

        const response = await HealthConnect.isAvailable();

        if (response.available) {
            const hasPerms =
                await HealthConnect.hasHealthConnectPermissions();

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

        const result =
            await HealthConnect.requestHealthConnectPermissions();

        console.log(JSON.stringify(result));

        const after =
            await HealthConnect.hasHealthConnectPermissions();

        console.log(JSON.stringify(after));
    }

    async isAvailable(): Promise<boolean> {
        await this.ensureInitialized();
        return this._isAvailable;
    }

    async configure(): Promise<void> {
        await HealthConnect.openHealthConnectSettings();
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
            console.log(
                "START UTC",
                JSON.stringify(dateRange.startUtc)
            );
            console.log(
                "END UTC",
                JSON.stringify(dateRange.endUtc)
            );

            const [
                steps,
                restingHeartRate,
                sleep,
                nutrition,
                activities
            ] = await Promise.all([
                HealthConnect.readSteps(dateRange),
                HealthConnect.readRestingHeartRate(dateRange),
                HealthConnect.readSleep(dateRange),
                HealthConnect.readNutrition(dateRange),
                HealthConnect.readActivities(dateRange)
            ]);

            const healthData: HealthConnectData = {
                steps,
                restingHeartRate,
                sleep,
                nutrition,
                activities: this.aggregateActivities(activities.activities)
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
        catch (e) {
            console.error("Device sync failed", e);
        }
        finally {
            this.syncing = false;
        }
    }


    // TODO: Parse HEVY format to deduce actual activities
    private aggregateActivities(
        activities: ActivityLogData[]
    ): ActivityLogData[] {

        const aggregated = new Map<string, ActivityLogData>();

        for (const activity of activities) {
            const existing = aggregated.get(activity.type);

            if (existing) {
                existing.duration += activity.duration;
            } else {
                aggregated.set(activity.type, {
                    ...activity
                });
            }
        }

        return Array.from(aggregated.values());
    }
}