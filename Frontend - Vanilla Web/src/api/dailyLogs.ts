import { get, post, put } from "./client";

import type { CreateDailyLogRequest, UpdateDailyLogRequest } from "../models/DailyLog";
import type { DailyLogResponse } from "../models/DailyLog";

export function getById(id: number): Promise<DailyLogResponse | null> {
    return get(`/api/dailylogs/${id}`);
}

export function getByDate(date: string): Promise<DailyLogResponse | null> {
    return get(`/api/dailylogs/by-date/${date}`);
}

export function create(value: CreateDailyLogRequest): Promise<DailyLogResponse> {
    return post("/api/dailylogs", value);
}

export function update(
    id: number,
    value: UpdateDailyLogRequest
): Promise<DailyLogResponse> {
    return put(`/api/dailylogs/${id}`, value);
}

export function publish(id: number): Promise<DailyLogResponse> {
    return post(`/api/dailylogs/${id}/publish`);
}

export function importLog(id: number): Promise<DailyLogResponse> {
    return put(`/api/dailylogs/${id}/import`);
}