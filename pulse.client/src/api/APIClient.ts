import type { AuthService } from "../services/AuthService";

export class APIClient {

    private readonly apiBase:string;
    private readonly authService:AuthService;

    constructor(apiBase:string, authService:AuthService) {
        this.apiBase = apiBase;
        this.authService = authService;
    }

    private async request<TResponse>(
        method: string,
        url: string,
        authenticated: boolean,
        body?: unknown
    ): Promise<TResponse> {
        const fullUrl = new URL(url, this.apiBase).toString();
        console.log(JSON.stringify(fullUrl));


        if (authenticated && !this.authService.isLoggedIn()) {
            throw new Error("Authentication required.");
        }

        await this.authService.ensureValidAccessToken();

        const headers: Record<string, string> = {};

        const token = this.authService.getAccessToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        if (body !== undefined) {
            headers["Content-Type"] = "application/json";
        }

        const response = await fetch(fullUrl, {
            method,
            headers,
            ...(body !== undefined && {
                body: JSON.stringify(body)
            })
        });

        if (response.status === 404)
            return null as TResponse;

        if (response.status === 401 && this.authService.isLoggedIn()) {
            await this.authService.ensureValidAccessToken(); // Try once again in case the token expired just after sending and before server received it

            return this.request(method, url, authenticated, body);
        }

        if (!response.ok)
            throw new Error(await response.text());

        if (response.status === 204)
            return undefined as TResponse;

        return response.json();
    }

    async get<TResponse>(
        url: string,
        authenticated = true
    ): Promise<TResponse | null> {
        return this.request("GET", url, authenticated);
    }

    async post<TRequest, TResponse>(
        url: string,
        body?: TRequest,
        authenticated = true
    ): Promise<TResponse> {
        return this.request("POST", url, authenticated, body);
    }

    async put<TRequest, TResponse>(
        url: string,
        body?: TRequest,
        authenticated = true
    ): Promise<TResponse> {
        return this.request("PUT", url, authenticated, body);
    }

    async del<TResponse>(
        url: string,
        authenticated = true): Promise<TResponse> {
        return this.request("DELETE", url, authenticated);
    }
}