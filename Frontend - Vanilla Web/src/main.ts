import "./style.css";
import "remixicon/fonts/remixicon.css";

import * as Error from "./screens/Error"
let cachedErrorScreen:HTMLElement|null = null;
function errorScreen():HTMLElement { return cachedErrorScreen ??= Error.render() } 

import * as Splash from "./screens/Splash"
let cachedSplashScreen:HTMLElement|null = null;
function splashScreen():HTMLElement { return cachedSplashScreen ??= Splash.render() } 

import * as Feed from "./screens/Feed";
let cachedFeedScreen:HTMLElement|null = null;
function feedScreen():HTMLElement { return cachedFeedScreen ??= Feed.render() } 

import * as Report from "./screens/Report";
let cachedReportScreen:HTMLElement|null = null;
function reportScreen():HTMLElement { return cachedReportScreen ??= Report.render() } 

import * as Profile from "./screens/Profile";
let cachedProfileScreen:HTMLElement|null = null;
function profileScreen():HTMLElement { return cachedProfileScreen ??= Profile.render() } 

import * as Settings from "./screens/Settings";
let cachedSettingsScreen:HTMLElement|null = null;
function settingsScreen():HTMLElement { return cachedSettingsScreen ??= Settings.render() } 

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

await Error.mount(screenContainer);
changeScreen(errorScreen());

await HealthConnect.initialize();

changeScreen(splashScreen())

try {
    // Need to mount and load. No lazy load for now
    await Report.mount(screenContainer);
} catch (error) {
    Error.set_error("Failed to mount Report")
    changeScreen(errorScreen())
}

renderApp()

function renderApp() {
    // Start on Feed Screen
    // Later we can add a splash screen or something
    // renderTabs() // No functionality yet
    // changeScreen(feedScreen())

    // Just for quick hot reload
    changeScreen(reportScreen())
}

function changeScreen(newScreen:HTMLElement) {
    screenContainer.replaceChildren(newScreen)
}

function renderTabs() {
    // Feed
    const feedButton = document.createElement("button");
    feedButton.textContent = "Feed";
    feedButton.onclick = () => changeScreen(feedScreen())
    tabsContainer.append(feedButton)

    // Report
    const reportButton = document.createElement("button");
    reportButton.textContent = "Report";
    reportButton.onclick = () => changeScreen(reportScreen())
    tabsContainer.append(reportButton)

    // Profile
    const profileButton = document.createElement("button");
    profileButton.textContent = "Profile";
    profileButton.onclick = () => changeScreen(profileScreen())
    tabsContainer.append(profileButton)

    // Report Change
    const settingsButton = document.createElement("button");
    settingsButton.textContent = "Settings";
    settingsButton.onclick = () => changeScreen(settingsScreen())
    tabsContainer.append(settingsButton)
}