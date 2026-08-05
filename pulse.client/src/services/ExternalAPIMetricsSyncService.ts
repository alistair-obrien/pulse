export interface ExternalAPIMetricsSyncService {
    isAvailable():boolean;
    sync(date: Date):void;
}