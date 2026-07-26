import "./style.css";
import "remixicon/fonts/remixicon.css";
import { Device } from '@capacitor/device';
const ENVIRONMENT: string = import.meta.env.VITE_ENVIRONMENT;
const API_BASE: string = import.meta.env.VITE_API_URL;


// import * as Error from "./screens/Error"
// let cachedErrorScreen:HTMLElement|null = null;
// function errorScreen():HTMLElement { return cachedErrorScreen ??= Error.render() } 

import * as Splash from "./screens/Splash"
let cachedSplashScreen:HTMLElement|null = null;
function splashScreen():HTMLElement { return cachedSplashScreen ??= Splash.render() } 

// import * as Feed from "./screens/Feed";
// let cachedFeedScreen:HTMLElement|null = null;
// function feedScreen():HTMLElement { return cachedFeedScreen ??= Feed.render() } 

import * as Report from "./screens/Report";
let cachedReportScreen:HTMLElement|null = null;
function reportScreen():HTMLElement { return cachedReportScreen ??= Report.render() } 

// import * as Profile from "./screens/Profile";
// let cachedProfileScreen:HTMLElement|null = null;
// function profileScreen():HTMLElement { return cachedProfileScreen ??= Profile.render() } 

// import * as Settings from "./screens/Settings";
// let cachedSettingsScreen:HTMLElement|null = null;
// function settingsScreen():HTMLElement { return cachedSettingsScreen ??= Settings.render() } 

const version_tag = document.createElement("div");
version_tag.className = "version-annotation";
version_tag.id = "version-tag";

const platform = (await Device.getInfo()).platform;

version_tag.innerText = `${platform} - ${ENVIRONMENT} - ${API_BASE}`;
document.body.append(version_tag);

const topButtons = document.createElement("div");
document.body.append(topButtons);

// Tabs for changing screen
const tabsContainer = document.createElement("div");
document.body.append(tabsContainer);

// Screen Container for screen contents
const screenContainer = document.createElement("div")
screenContainer.id = "Screen"
screenContainer.className = "screen";
document.body.append(screenContainer);

// TEST

import * as HealthConnect from "./platform/health-connect";

const splash = splashScreen();
document.body.append(splash);

// await Error.mount(screenContainer);
await HealthConnect.initialize();
await Report.mount(screenContainer);

changeScreen(reportScreen())

await Splash.finish();

function changeScreen(newScreen:HTMLElement) {
    screenContainer.replaceChildren(newScreen)
}

// function renderTabs() {
//     // Feed
//     const feedButton = document.createElement("button");
//     feedButton.textContent = "Feed";
//     feedButton.onclick = () => changeScreen(feedScreen())
//     tabsContainer.append(feedButton)

//     // Report
//     const reportButton = document.createElement("button");
//     reportButton.textContent = "Report";
//     reportButton.onclick = () => changeScreen(reportScreen())
//     tabsContainer.append(reportButton)

//     // Profile
//     const profileButton = document.createElement("button");
//     profileButton.textContent = "Profile";
//     profileButton.onclick = () => changeScreen(profileScreen())
//     tabsContainer.append(profileButton)

//     // Report Change
//     const settingsButton = document.createElement("button");
//     settingsButton.textContent = "Settings";
//     settingsButton.onclick = () => changeScreen(settingsScreen())
//     tabsContainer.append(settingsButton)
// }