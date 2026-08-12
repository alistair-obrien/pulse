import type { AppConfig } from "../AppConfig";
import { toDateKey } from "../utils/DateUtils";
import type { JourneyStepRecord } from "./JourneyRepository/JourneyStepRecord";
import { JourneyStepRecordStore } from "./JourneyRepository/JourneyStepRecordStore";

export class JourneyStepRepository {

    private readonly localStore: JourneyStepRecordStore;
    private readonly cloudStore: JourneyStepRecordStore;

    constructor(
        appConfig: AppConfig,
        prefix: string
    ) {
        const storagePrefix =
            `pulse_${appConfig.environment}:${prefix}`;

        this.localStore =
            new JourneyStepRecordStore(
                `${storagePrefix}:journey:local`
            );

        this.cloudStore =
            new JourneyStepRecordStore(
                `${storagePrefix}:journey:cloud`
            );
    }

    /**
     * Returns the effective Journey state.
     *
     * Local state takes precedence over cloud state.
     */
    getJourneyStepRecord(
        date: Date
    ): JourneyStepRecord | undefined {

        return (
            this.localStore.get(date) ??
            this.cloudStore.get(date)
        );
    }

    getJourneyStepRecords(
        from: Date,
        to: Date
    ): JourneyStepRecord[] {

        const cloudRecords = this.cloudStore.getRange(from, to);

        const localRecords = this.localStore.getRange(from, to);

        const records = new Map<string, JourneyStepRecord>();

        for (const record of cloudRecords) {
            records.set(
                toDateKey(record.date),
                record
            );
        }

        // Local records override cloud records.
        for (const record of localRecords) {
            records.set(
                toDateKey(record.date),
                record
            );
        }

        return [...records.values()];
    }

    /**
     * Creates/updates the local Journey snapshot.
     */
    set(record: JourneyStepRecord) {

        this.localStore.set(record);
    }

    /**
     * Returns true if a Journey snapshot exists
     * in the cloud store.
     */
    isPublished(date: Date): boolean {

        return this.cloudStore.get(date) !== undefined;
    }

    /**
     * Returns true if a local snapshot exists that
     * may not yet have been synchronized.
     */
    hasPendingChanges(date: Date): boolean {

        return this.localStore.get(date) !== undefined;
    }

    /**
     * Copies the local snapshot into the cloud store.
     *
     * The actual API synchronization can be performed
     * by the service/repository layer around this.
     */
    commit(date: Date) {

        const record = this.localStore.get(date);

        if (!record)
            return;

        this.cloudStore.set(record);
        this.localStore.remove(date);
    }

    /**
     * Discards all local Journey snapshots.
     */
    clearPendingChanges() {

        this.localStore.clear();
    }
}