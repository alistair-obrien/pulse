import { getLocalDayUtcRange, toDateKey } from "../../utils/DateUtils";

// Services
import type { DeviceMetricsSyncService } from "../DeviceMetricsSyncService";

// User
import type { UserSession } from "../../UserSession";

// Health
import {
    Health,
    type AggregationType,
    type AuthorizationOptions,
    type HealthDataType,
    type HealthSample
} from "@capgo/capacitor-health";

// Metrics
import type { SleepLogData } from "../../models/SleepLogData";
import { MetricTypeIds } from "../../models/MetricRegistry";


const HEALTH_DATA_TYPES = [
    "steps",
    "restingHeartRate",
    "sleep",
    "dietaryEnergyConsumed",
    "dietaryCarbohydratesConsumed",
    "dietaryProteinConsumed",
    "dietaryFatConsumed",
] satisfies HealthDataType[];

type PulseHealthDataType = typeof HEALTH_DATA_TYPES[number];


interface HealthData {
    steps: number;
    restingHeartRate: number;
    // totalSleep: number;
    nutritionTotalCalories: number;
    nutritionTotalCarbohydrates: number;
    nutritionTotalFat: number;
    nutritionTotalProtein: number;
}


const IMPORTERS = [
    {
        metric: MetricTypeIds.Steps,
        value: (health: HealthData) => health.steps
    },

    {
        metric: MetricTypeIds.RestingHeartRate,
        value: (health: HealthData) => health.restingHeartRate
    },

    // TODO
    // {
    //     metric: MetricTypeIds.Sleep,
    //     value: (health: HealthData) => health.totalSleep
    // },

    {
        metric: MetricTypeIds.Nutrition_Calories,
        value: (health: HealthData) => health.nutritionTotalCalories
    },

    {
        metric: MetricTypeIds.Nutrition_Carbs,
        value: (health: HealthData) => health.nutritionTotalCarbohydrates
    },

    {
        metric: MetricTypeIds.Nutrition_Fat,
        value: (health: HealthData) => health.nutritionTotalFat
    },

    {
        metric: MetricTypeIds.Nutrition_Protein,
        value: (health: HealthData) => health.nutritionTotalProtein
    },
    
] as const;


export class CapacitorHealthDeviceMetricsProvider
    implements DeviceMetricsSyncService {

    private initialized = false;
    private _isAvailable = false;
    private syncing = false;

    private readonly userSession: UserSession;

    constructor(userSession: UserSession) {
        this.userSession = userSession;
    }


    async initialize(): Promise<void> {

        if (this.initialized)
            return;

        const availability = await Health.isAvailable();

        if (!availability.available) {
            this.initialized = true;
            return;
        }

        const permissions: AuthorizationOptions = {
            read: [...HEALTH_DATA_TYPES],
            write: []
        };

        const authorization =
            await Health.checkAuthorization(permissions);

        if (authorization.readDenied.length > 0) {
            await this.openPermissions(permissions);
        }

        this._isAvailable = true;
        this.initialized = true;
    }


    private async openPermissions(
        permissions: AuthorizationOptions
    ): Promise<void> {

        console.log("Requesting health permissions...");

        const result =
            await Health.requestAuthorization(permissions);

        console.log(JSON.stringify(result));
    }


    async isAvailable(): Promise<boolean> {

        await this.ensureInitialized();

        return this._isAvailable;
    }


    async configure(): Promise<void> {

        await Health.openHealthConnectSettings();
    }


    private async ensureInitialized(): Promise<void> {

        if (!this.initialized)
            await this.initialize();
    }


    async sync(date: Date): Promise<void> {

        if (this.syncing) {
            console.log("Health Sync already syncing.");
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


            const start:Date = dateRange.startUtc;
            const end:Date = dateRange.endUtc;

            const [
                steps,
                restingHeartRate,
                calories,
                carbs,
                fat,
                protein
            ] = await Promise.all([
                this.queryAggregate("steps", start, end, "sum"),
                this.queryAggregate("restingHeartRate", start, end, "average"),
                this.queryAggregate("dietaryEnergyConsumed", start, end, "sum"),
                this.queryAggregate("dietaryCarbohydratesConsumed", start, end, "sum"),
                this.queryAggregate("dietaryFatConsumed", start, end, "sum"),
                this.queryAggregate("dietaryProteinConsumed", start, end, "sum"),
            ]);

            console.log(
                "HEALTH DATA",
                JSON.stringify({
                    steps,
                    restingHeartRate,
                    calories,
                    carbs,
                    fat,
                    protein
                })
            );


            const healthData: HealthData = {
                steps,
                restingHeartRate,
                // totalSleep: sleep,
                nutritionTotalCalories: calories,
                nutritionTotalCarbohydrates: carbs,
                nutritionTotalFat: fat,
                nutritionTotalProtein: protein
            };


            console.log(
                "HEALTH DATA",
                JSON.stringify(healthData)
            );


            for (const { metric, value } of IMPORTERS) {

                this.userSession.metrics.setDeviceMetric(
                    dateKey,
                    metric,
                    value(healthData)
                );
            }

        }
        catch (error) {

            console.error(
                "Device health sync failed",
                error
            );

        }
        finally {

            this.syncing = false;
        }
    }


    private async readSamples(
        dataType: PulseHealthDataType,
        startDate: Date,
        endDate: Date
    ): Promise<HealthSample[]> {

        const result = await Health.readSamples({
            dataType,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });

        return result.samples;
    }

    private async readAggregate(
    dataType: PulseHealthDataType,
    startDate: Date,
    endDate: Date,
    ): Promise<number> {

        const result = await Health.queryAggregated({
            dataType,
            bucket: "day",
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });

        return result.samples.reduce(
            (total, sample) => total + sample.value,
            0
        );
    }

    private async queryAggregate(
        dataType: PulseHealthDataType,
        startDate: Date,
        endDate: Date,
        aggregation: AggregationType
    ): Promise<number> {

        const result = await Health.queryAggregated({
            dataType,
            bucket: "day",
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            aggregation: aggregation
        });

        const sample = result.samples[0];

        return sample?.values?.[aggregation] ?? 0;
    }
}