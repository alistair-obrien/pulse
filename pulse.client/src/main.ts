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

console.log("API URL:", apiBase);

if (!apiBase) {
    throw new Error("VITE_API_URL is not configured");
}

let apiUrl: URL;

try {
    apiUrl = new URL(apiBase);
} catch {
    throw new Error(`VITE_API_URL is not a valid URL: "${apiBase}"`);
}

if (!["http:", "https:"].includes(apiUrl.protocol)) {
    throw new Error(
        `VITE_API_URL must use HTTP or HTTPS: "${apiBase}"`
    );
}

if (platform !== "web" && apiUrl.hostname === "api.localhost") {
    apiUrl.hostname = window.location.hostname;
    apiBase = apiUrl.toString();
}

console.log("API URL resolved:", JSON.stringify(apiBase));


declare const __APP_SOURCE__: string;
const appConfig:AppConfig = {
    appSource: __APP_SOURCE__,
    platform: platform,
    environment: import.meta.env.VITE_ENVIRONMENT,
    apiBase: apiBase,
    versionNumber: version,
    splashEnabled: import.meta.env.VITE_SPLASH_ENABLED === "true",
    showDebugVersionAnnotation: import.meta.env.VITE_VERSION_TEXT_ENABLED === "true",
    socialLoginIds: {
        googleWebClientId: "945193684598-alu18k11ei67297aj839cejoekpb6flb.apps.googleusercontent.com"
    }
}

// import.meta.env.VITE_GOOGLE_LOGIN_WEBCLIENT_ID

const googleClientId =
    import.meta.env.VITE_GOOGLE_LOGIN_WEBCLIENT_ID;

console.error(
    "Google Web Client ID:",
    googleClientId
        ? googleClientId
        : "MISSING"
);

 const pulseApp = new PulseApp(appConfig);
 await pulseApp.start();