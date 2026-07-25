import { registerPlugin } from "@capacitor/core";

// Java Plugin HealthConnectPlugin.java
export const HealthConnect = registerPlugin<HealthConnectPlugin>("HealthConnect", {
    web: () => Promise.resolve(new HealthConnectWeb()),
});

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

export let healthConnectAvailable:boolean = false;

export async function initialize() {

    const response = await HealthConnect.isAvailable()
    
    if (response.available) {
        const hasPerms = await HealthConnect.hasHealthConnectPermissions();
        console.log(JSON.stringify(hasPerms));

        if (!hasPerms.has_permissions) {
            console.log("Requesting permissions...");

            const result = await HealthConnect.requestHealthConnectPermissions();

            console.log(JSON.stringify(result));

            const after = await HealthConnect.hasHealthConnectPermissions();

            console.log(JSON.stringify(after));
        }

        healthConnectAvailable = true;
    }
}

interface HealthConnectPlugin {
    isAvailable() : Promise<AvailabilityResult>;

    hasHealthConnectPermissions() : Promise<HasHealthConnectPermissionsResult>;
    
    requestHealthConnectPermissions() : Promise<{}>;

    readSteps(options:ReadStepsOptions) : Promise<ReadStepsResult>;

    readSleep(options:ReadSleepOptions) : Promise<ReadSleepResult>;

    readNutrition(options:ReadNutritionOptions) : Promise<ReadNutritionResult>;

    readRestingHeartRate(options:ReadRestingHeartRateOptions) : Promise<ReadRestingHeartRateResult>;

    // readHeartRate(start:Date, end:Date) : Promise<{}>;

    // readSleep(start:Date, end:Date) : Promise<{}>;

    // writeWeight(weight:number) : Promise<{}>;

    // writeExercise(exercise:number) : Promise<{}>;
}

class HealthConnectWeb implements HealthConnectPlugin {

    async isAvailable(): Promise<AvailabilityResult> {
        return { available: false, status: -1, reason: "Health Connect not supported on Web" }
    }
    
    hasHealthConnectPermissions(): Promise<HasHealthConnectPermissionsResult> {
        throw new Error("Method not implemented.");
    }
    
    requestHealthConnectPermissions(): Promise<{}> {
        throw new Error("Method not implemented.");
    }
    
    readSteps(options:ReadStepsOptions): Promise<ReadStepsResult> {
        throw new Error("Method not implemented.");
    }
    
    readSleep(options: ReadSleepOptions): Promise<ReadSleepResult> {
        throw new Error("Method not implemented.");
    }

    readNutrition(options: ReadNutritionOptions): Promise<ReadNutritionResult> {
        throw new Error("Method not implemented.");
    }

    readRestingHeartRate(options: ReadRestingHeartRateOptions): Promise<ReadRestingHeartRateResult> {
        throw new Error("Method not implemented.");
    }
}

