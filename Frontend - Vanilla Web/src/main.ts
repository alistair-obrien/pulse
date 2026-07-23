import "./style.css";


import * as Error from "./screens/Error"
let cachedErrorScreen:HTMLElement|null = null;
function errorScreen(error: string):HTMLElement { return cachedErrorScreen ??= Error.render(error) } 

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

// Tabs for changing screen
const tabsContainer = document.createElement("div");
document.body.append(tabsContainer);

// Screen Container for screen contents
const screenContainer = document.createElement("div")
screenContainer.id = "Screen"
document.body.append(screenContainer);

changeScreen(splashScreen())

try {
    // Need to mount and load. No lazy load for now
    await Report.mount(screenContainer);
} catch (error) {
    changeScreen(errorScreen(String(error)))
}

renderApp()

function renderApp() {
    // Start on Feed Screen
    // Later we can add a splash screen or something
    renderTabs()
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
