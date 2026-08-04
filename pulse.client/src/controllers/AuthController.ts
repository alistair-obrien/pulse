import * as API from "../api/API"
import type { AppConfig, SocialLoginIds } from "../AppConfig";

import * as GoogleAndroid from "./AuthProviders/GoogleAndroid"
import * as GoogleWeb from "./AuthProviders/GoogleWeb"

interface AuthState {
    accessToken: string; // Our JWT token
    refreshToken: string; // Refresh token stored in our Db
    expiresAtUtc: number;
}

let currentSession: AuthState | null = null;

let STORAGE_KEY = '';

let userPlatform = '';

let socialLoginIds:SocialLoginIds | null = null;

export async function initialize(appConfig:AppConfig) {
    userPlatform = appConfig.platform;
    STORAGE_KEY = `${appConfig.environment}:auth`;
    socialLoginIds = appConfig.socialLoginIds;
    loadSession();
}

export function isLoggedIn(): boolean {

    console.log(currentSession);

    return currentSession !== null && Date.now() < currentSession.expiresAtUtc;
}

export function getCurrentUser(): AuthState | null {
    return currentSession;
}

export async function registerEmail(request: API.EmailRegisterRequest): Promise<void> {
    return await API.register(request);
}

export async function loginEmail(request: API.EmailLoginRequest): Promise<void> {
    const response = await API.login(request);

    currentSession = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAtUtc: Date.now() + response.expiryInSeconds * 1000
    };

    saveSession();
}

export function getAccessToken(): string | null {
    return currentSession?.accessToken ?? null;
}

export function logout(): void {
    currentSession = null;
    saveSession();
}

// >>> SESSION LOCAL STORAGE SAVE <<<
function saveSession(): void {
    if (currentSession === null)
        localStorage.removeItem(STORAGE_KEY);
    else
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSession));
}

function loadSession(): void {
    const json = localStorage.getItem(STORAGE_KEY);

    console.log("loadSession", json)

    if (json === null)
        return;

    try {
        currentSession = JSON.parse(json);
    }
    catch {
        localStorage.removeItem(STORAGE_KEY);
    }
}

// >>> REFRESH TOKEN <<<
let refreshPromise: Promise<void> | null = null;

export async function ensureValidAccessToken(): Promise<void> {
    if (!shouldRefreshToken())
        return;

    if (refreshPromise === null) {
        refreshPromise = refreshToken()
            .finally(() => refreshPromise = null);
    }

    await refreshPromise;
}

function shouldRefreshToken(): boolean {
    if (currentSession === null)
        return false;

    // Refresh if less than 60 seconds remain
    return Date.now() >= currentSession.expiresAtUtc - 60_000;
}

async function refreshToken(): Promise<void> {
    if (currentSession === null)
        return;

    try {
        const response = await API.refresh({
            refreshToken: currentSession.refreshToken
        });

        currentSession = {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            expiresAtUtc: Date.now() + response.expiryInSeconds * 1000
        };

        saveSession();

        return;
    }
    catch (e) {
        console.error("Token refresh failed", e);
        logout();
        return;
    }
}


// >>> GOOFLE <<<
export interface GoogleCredential {
    idToken?: string;
    authorizationCode?: string;
}

export async function loginGoogle() {

    let googleCredential:GoogleCredential = { }

    const clientId = socialLoginIds?.googleWebClientId;

    if (!clientId)
        throw new Error("Google Web Client ID has not been configured.");

    switch (userPlatform) {
        case "android":
            googleCredential = await GoogleAndroid.login(clientId);
            break;
        case "web":
            googleCredential = await GoogleWeb.login(clientId);
            break;
        default:
            throw new Error(`Google login not supported on ${userPlatform}`);
    }

    await completeGoogleLogin(googleCredential);
}

async function completeGoogleLogin(googleCredential: GoogleCredential) {
    const response = await API.googleLogin(googleCredential);

    console.log(response);

    currentSession = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAtUtc: Date.now() + response.expiryInSeconds * 1000
    };

    saveSession();
}
