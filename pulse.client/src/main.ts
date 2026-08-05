import './ui/styles/main.css'


import { Device } from "@capacitor/device";
import { App } from "@capacitor/app"
import { PulseApp } from "./ui/PulseApp";
import type { AppConfig } from "./AppConfig";

// Anything that needs to be initialized before first UI render
const platform = (await Device.getInfo()).platform;
let version = "0";

if (platform != "web")
{
    const appInfo = await App.getInfo();
    version = appInfo.version;
    version = appInfo.version;
}

let apiBase = import.meta.env.VITE_API_URL;

console.log(JSON.stringify(apiBase));

if (platform !== "web") {
    const url = new URL(apiBase);

    if (url.hostname === "api.localhost") {
        url.hostname = window.location.hostname;
        apiBase = url.toString();
    }
}

console.log(JSON.stringify(apiBase));

declare const __APP_SOURCE__: string;
const appConfig:AppConfig = {
    appSource: __APP_SOURCE__,
    platform: platform,
    environment: import.meta.env.VITE_ENVIRONMENT,
    apiBase: apiBase,
    versionNumber: version,
    splashEnabled: import.meta.env.VITE_SPLASH_ENABLED === "true",
    showDebugVersionAnnotation: import.meta.env.VERSION_TEXT_ENABLED === "true",
    socialLoginIds: {
        googleWebClientId: import.meta.env.VITE_GOOGLE_LOGIN_WEBCLIENT_ID
    }
}

 const pulseApp = new PulseApp(appConfig);
 await pulseApp.start();