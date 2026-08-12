export interface DeviceMetricsSyncService {
    
    initialize(): void;
    isAvailable(): Promise<boolean>;
    sync(date: Date): void;
    configure(): void;
}