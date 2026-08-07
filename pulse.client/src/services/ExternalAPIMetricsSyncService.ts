export interface ExternalAPIMetricsSyncService {
    name:string;

    isAvailable():boolean;
    getAPIKey():string;
    setAPIKey(value: string): void
    
    sync(date: Date):void;
}