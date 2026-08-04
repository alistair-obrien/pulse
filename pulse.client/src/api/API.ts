import type { GoogleCredential } from "../controllers/AuthController";
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
export interface EmailRegisterRequest {
    email: string;
    password: string;
}
export function register(request: EmailRegisterRequest): Promise<void> {
    return post("/register", request, false);
}

export interface EmailLoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    accessToken: string;
    expiryInSeconds: number;
    refreshToken: string;
}

export function login(request: EmailLoginRequest): Promise<LoginResponse> {
    return post("/login", request, false);
}

export function googleLogin(googleCredential: GoogleCredential): Promise<LoginResponse> {
    return post("/api/auth/google", googleCredential, false);
}

export interface RefreshRequest {
    refreshToken: string;
}

export function refresh(request: RefreshRequest): Promise<LoginResponse> {
    return post("api/auth/refresh", request);
}

// >>> JOURNEY <<<
export async function getJourneySteps(
    page: number
): Promise<GetJourneyStepsResponse | null> {
    const result = await get<GetJourneyStepsResponse>(
        `/api/journeysteps/${page}`
    );

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