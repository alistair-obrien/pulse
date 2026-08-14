import type { API, LoginResponse } from "../api/API";
import type { PulseAppConfig } from "../PulseAppConfig";
import type { UserSession } from "../UserSession";

// TODO
export interface AuthProvider {
    readonly providerName: string;
    login():Promise<LoginResponse>;
}

interface AuthState {
    accessToken: string; // Our JWT token
    refreshToken: string; // Refresh token stored in our Db
    expiresAtUtc: number;
}

export class AuthService {

    private readonly authProviders: AuthProvider[] = [];
    readonly availableProviders:string[] = [];
    readonly providerLookup:Record<string, AuthProvider> = {};

    private readonly storageKey:string;
    private readonly api: API;
    private readonly userSession: UserSession;
    
    private currentSession: AuthState | null = null;

    // >>> REFRESH TOKEN <<<
    refreshPromise: Promise<void> | null = null;

    constructor(appConfig:PulseAppConfig, api:API, userSession:UserSession) {
        this.userSession = userSession;
        this.storageKey = `${appConfig.environment}:auth`;
        this.loadSession();
        this.api = api;
    }

    addProvider(authProvider:AuthProvider) {
        this.authProviders.push(authProvider);
        this.availableProviders.push(authProvider.providerName);
        this.providerLookup[authProvider.providerName] = authProvider;
    }

    isLoggedIn(): boolean {
        return this.currentSession !== null && Date.now() < this.currentSession.expiresAtUtc;
    }

    async login(authProviderName:string) {
        
        const provider = this.providerLookup[authProviderName];

        const response = await provider.login();
        this.currentSession = {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            expiresAtUtc: Date.now() + response.expiryInSeconds * 1000
        };

        this.userSession.setUser(response.userId);

        this.saveSession();
    }

    registerEmail(arg0: { email: string; password: string; }) {
    }

    loginEmail(arg0: { email: string; password: string; }) {
    }


    logout(): void {
        this.currentSession = null;
        this.saveSession();
    }


    getAccessToken(): string | null {
        return this.currentSession?.accessToken ?? null;
    }


    // >>> SESSION LOCAL STORAGE SAVE <<<
    saveSession(): void {
        if (this.currentSession === null)
            localStorage.removeItem(this.storageKey);
        else
            localStorage.setItem(this.storageKey, JSON.stringify(this.currentSession));
    }

    loadSession(): void {
        const json = localStorage.getItem(this.storageKey);

        if (json === null)
            return;

        try {
            this.currentSession = JSON.parse(json);
        }
        catch {
            localStorage.removeItem(this.storageKey);
        }
    }

    async ensureValidAccessToken(): Promise<void> {
        if (!this.shouldRefreshToken())
            return;

        if (this.refreshPromise === null) {
            this.refreshPromise = this.refreshToken()
                .finally(() => this.refreshPromise = null);
        }

        await this.refreshPromise;
    }

    shouldRefreshToken(): boolean {
        if (this.currentSession === null)
            return false;

        // Refresh if less than 60 seconds remain
        return Date.now() >= this.currentSession.expiresAtUtc - 60_000;
    }

    async refreshToken(): Promise<void> {
        if (this.currentSession === null)
            return;

        try {
            const response = await this.api.refresh({
                refreshToken: this.currentSession.refreshToken
            });

            this.currentSession = {
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                expiresAtUtc: Date.now() + response.expiryInSeconds * 1000
            };

            this.saveSession();

            return;
        }
        catch (e) {
            console.error("Token refresh failed", e);
            this.logout();
            return;
        }
    }
}
