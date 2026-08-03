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
export async function loginGoogle() {
    switch (userPlatform) {
        case "android":
            return loginGoogleAndroid();

        case "web":
            return loginGoogleWeb();

        default:
            throw new Error(`Google login not supported on ${userPlatform}`);
    }
}

async function completeGoogleLogin(idToken: string) {
    const response = await API.googleLogin(idToken);
    
    currentSession = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAtUtc: Date.now() + response.expiresIn * 1000
    };
}

let capgoGoogleInitialized = false;
async function loginGoogleAndroid() {
    // Capgo
    if (!capgoGoogleInitialized)
    {
        capgoGoogleInitialized = true;
        await SocialLogin.initialize({
            google: {
                webClientId: socialLoginIds?.googleWebClientId, 
            },
        });
    }
    const res = await SocialLogin.login({
        provider: 'google',
        options: { },
    });

    if (res.result.responseType !== "online" || !res.result.idToken) {
        throw new Error("Google login did not return an ID token.");
    }

    console.log(JSON.stringify(res));
    return completeGoogleLogin(res.result.idToken);
}

async function loginGoogleWeb() {
    // Google Identity Services
    const token = await getGoogleIdToken();
    await completeGoogleLogin(token);
}

// >>> Facebook <<<
let capgoFacebookInitialized = false;
export async function loginFacebook() 
{
    if (!capgoFacebookInitialized) {
        capgoFacebookInitialized = true;
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
let capgoAppleInitialized = false;
export async function loginApple() 
{
    if (!capgoAppleInitialized) {
        capgoAppleInitialized = true;
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

