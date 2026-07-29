import type { AppConfig } from "../AppConfig";
import * as Auth from "../controllers/AuthController";

let _appConfig:AppConfig;
export function initialize(appConfig:AppConfig) {
    _appConfig = appConfig;
}

async function request<TResponse>(
    method: string,
    url: string,
    authenticated: boolean,
    body?: unknown
): Promise<TResponse> {

    if (authenticated && !Auth.isLoggedIn()) {
        throw new Error("Authentication required.");
    }

    await Auth.ensureValidAccessToken();

    const headers: Record<string, string> = {};

    const token = Auth.getAccessToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${_appConfig.apiBase}${url}`, {
        method,
        headers,
        ...(body !== undefined && {
            body: JSON.stringify(body)
        })
    });

    if (response.status === 404)
        return null as TResponse;

    if (response.status === 401 && Auth.isLoggedIn()) {
        await Auth.ensureValidAccessToken(); // Try once again in case the token expired just after sending and before server received it

        return request(method, url, authenticated, body);
    }

    if (!response.ok)
        throw new Error(await response.text());

    if (response.status === 204)
        return undefined as TResponse;

    return response.json();
}

export function get<TResponse>(
    url: string,
    authenticated = true
): Promise<TResponse | null> {
    return request("GET", url, authenticated);
}

export function post<TRequest, TResponse>(
    url: string,
    body?: TRequest,
    authenticated = true
): Promise<TResponse> {
    return request("POST", url, authenticated, body);
}

export function put<TRequest, TResponse>(
    url: string,
    body?: TRequest,
    authenticated = true
): Promise<TResponse> {
    return request("PUT", url, authenticated, body);
}

export function del<TResponse>(
    url: string,
    authenticated = true): Promise<TResponse> {
    return request("DELETE", url, authenticated);
}