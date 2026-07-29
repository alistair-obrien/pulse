import type { DateKey } from "../models/DateKey";
import type { MetricTypeId } from "../models/MetricRegistry";
import { get, post, put } from "./APIClient";

// >>> PUBLISH : TODO: This is old <<<
export function publish(dateKey:DateKey): Promise<boolean> {
    return post(`/api/dailylogs/${dateKey}/publish`);
}

// >>> METRICS <<<
export function getMetrics(
    dateKey: DateKey
): Promise<Partial<Record<MetricTypeId, unknown>> | null> {
    return get(`/api/metrics/${dateKey}`);
}

export function getMetric<T>(dateKey:DateKey, metricTypeId:MetricTypeId): Promise<T | null> {
    return get(`/api/metrics/${dateKey}/${metricTypeId}`);
}

export function setMetric<T>(dateKey:DateKey, metricTypeId:MetricTypeId, value:T): Promise<boolean> {
    return put(`/api/metrics/${dateKey}/${metricTypeId}`, { metricData: value });
}

// >>> AUTH <<<
export interface RegisterRequest {
    email: string;
    password: string;
}
export function register(request: RegisterRequest): Promise<void> {
    return post("/register", request, false);
}


export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    tokenType: "Bearer";
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
}
export function login(request: LoginRequest): Promise<LoginResponse> {
    return post("/login", request, false);
}

export interface RefreshRequest {
    refreshToken: string;
}
export interface RefreshResponse {
    tokenType: "Bearer";
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
}
export function refresh(request: RefreshRequest): Promise<RefreshResponse> {
    return post("/refresh", request);
}


// share

// addFriend