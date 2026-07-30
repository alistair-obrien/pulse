import * as API from "../api/API"
import type { AppConfig } from "../AppConfig";

interface AuthState {
    accessToken: string;
    refreshToken: string;
    expiresAtUtc: number;
}

let currentSession: AuthState | null = null;

let STORAGE_KEY = '';

loadSession();

export function initialize(appConfig:AppConfig) {
    STORAGE_KEY = `${appConfig.environment}:auth`
}

export function isLoggedIn(): boolean {
    return currentSession !== null && Date.now() < currentSession.expiresAtUtc;
}

export function getCurrentUser(): AuthState | null {
    return currentSession;
}

export async function register(request: API.RegisterRequest): Promise<void> {
    return await API.register(request);
}

export async function login(request: API.LoginRequest): Promise<void> {
    const response = await API.login(request);

    currentSession = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAtUtc: Date.now() + response.expiresIn * 1000
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
            expiresAtUtc: Date.now() + response.expiresIn * 1000
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