export class DataStore {
    protected readonly storagePrefix: string;

    constructor(storagePrefix: string) {
        this.storagePrefix = storagePrefix;
    }
}