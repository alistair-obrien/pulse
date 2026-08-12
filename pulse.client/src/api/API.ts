import { JourneyStep } from "../models/JourneyStep";
import type { MetricTypeId, MetricTypes } from "../models/MetricRegistry";
import type { UserData } from "../repositories/UserDataRepository/UserData";
import type { GoogleCredential } from "../services/AuthProviders/Google/GoogleAuthCredential";
import type { DateKey } from "../utils/DateUtils";
import type { APIClient } from "./APIClient";

export class API {
    
    private apiClient!: APIClient;

    attachClient(apiClient:APIClient) {
        this.apiClient = apiClient;
    }

    // >>> METRICS <<<
    // Single metric
    async getMetric<K extends MetricTypeId>(
        dateKey: DateKey,
        metricTypeId: K
    ): Promise<MetricTypes[K] | null> {
        return this.apiClient.get(`/api/metrics/${dateKey}/${metricTypeId}`);
    }

    // Get all metrics for day
    async  getMetrics(
        dateKey: DateKey
    ): Promise<Partial<MetricTypes> | null> {
        return this.apiClient.get(`/api/metrics/${dateKey}`);
    }

    // Set single metric
    async setMetric<K extends MetricTypeId>(
        dateKey: DateKey,
        metricTypeId: K,
        value: MetricTypes[K]
    ): Promise<boolean> {
        return this.apiClient.put(`/api/metrics/${dateKey}/${metricTypeId}`, {
            metricData: value
        });
    }

    // Set all input metrics for day
    async setMetrics(
        dateKey: DateKey,
        value: Partial<MetricTypes>
    ): Promise<boolean> {
        return this.apiClient.put(`/api/metrics/${dateKey}`, value);
    }

    // >>> AUTH <<<
    async register(request: EmailRegisterRequest): Promise<void> {
        return this.apiClient.post("/register", request, false);
    }

    async emailLogin(request: EmailLoginRequest): Promise<LoginResponse> {
        return this.apiClient.post("/login", request, false);
    }

    async googleLogin(googleCredential: GoogleCredential): Promise<LoginResponse> {
        return this.apiClient.post("/api/auth/google", googleCredential, false);
    }

    async refresh(request: RefreshRequest): Promise<LoginResponse> {
        return this.apiClient.post("/api/auth/refresh", request);
    }

    // >>> JOURNEY <<<
    async getJourneySteps(
        page: number
    ): Promise<GetJourneyStepsResponse | null> {
        const result = await this.apiClient.get<GetJourneyStepsResponse>(
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

    async likeJourneyStep(dateKey:DateKey, userId: string): Promise<{ liked: boolean }> {
        return this.apiClient.put(`/api/journeysteps/${dateKey}/${userId}/like`); 
    }

    async putJournalStep(dateKey: DateKey): Promise<boolean> {
        return this.apiClient.put(`/api/journeysteps/${dateKey}`); 
    }

    // >>> USER DATA <<<
    async getUserData(): Promise<UserData | null> {
        return this.apiClient.get("/api/userdata");
    }

    async setUserData(userData: UserData): Promise<boolean> {
        return this.apiClient.put("/api/userdata", userData);
    }
}

export interface RefreshRequest {
    refreshToken: string;
}

export interface GetJourneyStepsResponse {
    page: number;
    pages: number;
    journeySteps: JourneyStep[];
}

export interface EmailRegisterRequest {
    email: string;
    password: string;
}

export interface EmailLoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    expiryInSeconds: number;
    refreshToken: string;
    userId: string;
}