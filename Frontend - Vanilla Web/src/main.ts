import './ui/styles/main.css'

import { Device } from "@capacitor/device";
import { App } from "@capacitor/app"
import * as DeviceMetricsSyncController from "./controllers/DeviceMetricsSyncController";
import * as AuthController from "./controllers/AuthController"

import * as APIClient from "./api/APIClient"
import { PulseApp } from "./ui/PulseApp";
import type { AppConfig } from "./AppConfig";

// Anything that needs to be initialized before first UI render
const platform = (await Device.getInfo()).platform;
let version = "0";

if (platform != "web")
{
    version = (await App.getInfo()).version;
}

const appConfig:AppConfig = {
    platform: platform,
    environment: import.meta.env.VITE_ENVIRONMENT,
    apiBase: import.meta.env.VITE_API_URL,
    versionNumber: version
}

await DeviceMetricsSyncController.initialize(appConfig);
await AuthController.initialize(appConfig);
await APIClient.initialize(appConfig);

const splashEnabled = import.meta.env.VITE_SPLASH_ENABLED === "true";
const versionTextEnabled = import.meta.env.VERSION_TEXT_ENABLED === "true";

 const pulseApp = new PulseApp(appConfig, splashEnabled, versionTextEnabled);
 await pulseApp.start();