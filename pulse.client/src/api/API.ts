import type { GoogleLoginResponse } from "@capgo/capacitor-social-login";
import type { DateKey } from "../data-store/DateKey";
import { JourneyStep } from "../models/JourneyStep";
import type { MetricTypeId, MetricTypes } from "../models/MetricRegistry";
import { get, post, put } from "./APIClient";



// >>> METRICS <<<

// Single metric
export function getMetric<K extends MetricTypeId>(
    dateKey: DateKey,
    metricTypeId: K
): Promise<MetricTypes[K] | null> {
    return get(`/api/metrics/${dateKey}/${metricTypeId}`);
}

// Get all metrics for day
export function getMetrics(
    dateKey: DateKey
): Promise<Partial<MetricTypes> | null> {
    return get(`/api/metrics/${dateKey}`);
}

// Set single metric
export function setMetric<K extends MetricTypeId>(
    dateKey: DateKey,
    metricTypeId: K,
    value: MetricTypes[K]
): Promise<boolean> {
    return put(`/api/metrics/${dateKey}/${metricTypeId}`, {
        metricData: value
    });
}

// Set all input metrics for day
export function setMetrics(
    dateKey: DateKey,
    value: Partial<MetricTypes>
): Promise<boolean> {
    return put(`/api/metrics/${dateKey}/${value}`);
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

export function googleLogin(idToken: string): Promise<LoginResponse> {

    return post("/api/auth/google", {
        idToken: idToken
    }, false);
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

// >>> JOURNEY <<<
export async function getJourneySteps(
    page: number
): Promise<GetJourneyStepsResponse | null> {
    const result = await get<GetJourneyStepsResponse>(
        `/api/journeysteps/${page}`
    );

    console.log(result);

    if (!result)
        return null;

    return {
        page: result.page,
        pages: result.pages,
        journeySteps: result.journeySteps.map(x => JourneyStep.fromJson(x))
    };
}

export function likeJourneyStep(dateKey:DateKey, userId: string): Promise<{ liked: boolean }> {
    return put(`/api/journeysteps/${dateKey}/${userId}/like`); 
}

export function putJournalStep(dateKey: DateKey): Promise<boolean> {
    return put(`/api/journeysteps/${dateKey}`); 
}

export interface GetJourneyStepsResponse {
    page: number;
    pages: number;
    journeySteps: JourneyStep[];
}