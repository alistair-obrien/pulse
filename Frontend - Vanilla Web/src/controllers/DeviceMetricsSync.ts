import type { AppConfig } from "../AppConfig";
import * as HealthConnect from "../platform/android-health-connect";
import * as HealthKit from  "../platform/ios-health-kit";

let _appConfig:AppConfig;

export function initialize(appConfig:AppConfig) {
    _appConfig = appConfig;
    
    if (_appConfig.platform == "android") {
        return HealthConnect.initialize();
    }
    else if (_appConfig.platform == "ios") {
        return HealthKit.initialize();
    }
}

export function isAvailable() : boolean {
    if (_appConfig.platform == "android") {
        return HealthConnect.isAvailable();
    }
    else if (_appConfig.platform == "ios") {
        return HealthKit.isAvailable();
    }

    return false;
}

export async function sync(date: Date) {
    
    if (_appConfig.platform == "android") {
        await HealthConnect.sync(date);
    }
    else if (_appConfig.platform == "ios") {
        await HealthKit.sync(date); //TODO
    }
}