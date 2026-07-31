import { SocialLogin } from "@capgo/capacitor-social-login";
import * as API from "../api/API"
import type { AppConfig, SocialLoginIds } from "../AppConfig";

interface AuthState {
    accessToken: string; // Our JWT token
    refreshToken: string; // Refresh token stored in our Db
    expiresAtUtc: number;
}

let currentSession: AuthState | null = null;

let STORAGE_KEY = '';

let userPlatform = '';

let socialLoginIds:SocialLoginIds | null = null;

loadSession();

export async function initialize(appConfig:AppConfig) {
    userPlatform = appConfig.platform;
    STORAGE_KEY = `${appConfig.environment}:auth`;
    socialLoginIds = appConfig.socialLoginIds;
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

// >>> GOOFLE <<<
let googleInitialized = false;
export async function loginGoogle() {
    if (!googleInitialized)
    {
        googleInitialized = true;
        // Google
        if (userPlatform == "web" || userPlatform == "android") {
            await SocialLogin.initialize({
                google: {
                    webClientId: socialLoginIds?.googleWebClientId,
                },
            });
        }
    }

    else if (userPlatform == "android" || userPlatform == "web") {
        try {
            const res = await SocialLogin.login({
                provider: 'google',
                options: { },
            });
            console.log(JSON.stringify(res));

            // TODO
            const response = await API.googleLogin(res.result);
            currentSession = {
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                expiresAtUtc: Date.now() + response.expiresIn * 1000
            };

            saveSession();

        } catch (error: any) {
            console.log(error.message);
            console.log(error.code);
            console.dir(error);
        }
    }
}

// >>> Facebook <<<
let facebookInitialized = false;
export async function loginFacebook() 
{
    if (!facebookInitialized) {
        facebookInitialized = true;
        // Facebook
        await SocialLogin.initialize({
            facebook: {
                appId: 'your-app-id',
                clientToken: 'your-client-token',
            },
        });
    }

    const res = await SocialLogin.login({
    provider: 'facebook',
    options: {
        permissions: ['email', 'public_profile'],
    },
    });
    console.log(JSON.stringify(res));
}

// >>> APPLE <<<
let appleInitialized = false;
export async function loginApple() 
{
    if (!appleInitialized) {
        appleInitialized = true;
        await SocialLogin.initialize({
        apple: {
            clientId: 'your-client-id',
            redirectUrl: 'your-redirect-url',
        },
        });
    }

    const res = await SocialLogin.login({
    provider: 'apple',
    options: {
        scopes: ['email', 'name'],
    },
    });

    console.log(JSON.stringify(res));
}

export function loginTwitter() 
{

}

