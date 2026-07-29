import './ui/styles/main.css'

import { Device } from "@capacitor/device";
import * as DeviceMetricsSync from "./controllers/DeviceMetricsSyncController";
import * as APIClient from "./api/APIClient"
import { PulseApp } from "./ui/PulseApp";
import type { AppConfig } from "./AppConfig";

// Anything that needs to be initialized before first UI render
const platform = (await Device.getInfo()).platform;

const appConfig:AppConfig = {
    platform: platform,
    environment: import.meta.env.VITE_ENVIRONMENT,
    apiBase: import.meta.env.VITE_API_URL,
}

await DeviceMetricsSync.initialize(appConfig);
await APIClient.initialize(appConfig);

const splashEnabled = import.meta.env.VITE_SPLASH_ENABLED === "true";
const versionTextEnabled = import.meta.env.VERSION_TEXT_ENABLED === "true";

 const pulseApp = new PulseApp(appConfig, splashEnabled, versionTextEnabled);
 await pulseApp.start();