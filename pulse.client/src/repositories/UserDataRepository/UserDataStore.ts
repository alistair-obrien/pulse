import { DataStore } from "../DataStore";
import type { UserData } from "./UserData";

export class UserDataStore extends DataStore {

    private data: UserData = {};
    private loaded = false;

    private ensureLoaded() {
        if (this.loaded)
            return;

        this.load();
        this.loaded = true;
    }

    private load() {
        const json = localStorage.getItem(this.storagePrefix);

        if (!json)
            return;

        this.data = JSON.parse(json);
    }

    private save() {
        localStorage.setItem(
            this.storagePrefix,
            JSON.stringify(this.data)
        );
    }

    get<K extends keyof UserData>(
        key: K
    ): UserData[K] | undefined {
        this.ensureLoaded();
        return this.data[key];
    }

    set<K extends keyof UserData>(
        key: K,
        value: UserData[K]
    ) {
        this.ensureLoaded();

        this.data[key] = value;
        this.save();
    }

    getAll(): UserData {
        this.ensureLoaded();

        return { ...this.data };
    }

    setAll(data: UserData) {
        this.data = { ...data };
        this.loaded = true;

        this.save();
    }

    remove<K extends keyof UserData>(key: K) {
        this.ensureLoaded();

        delete this.data[key];
        this.save();
    }

    clear() {
        this.data = {};
        this.loaded = true;

        localStorage.removeItem(this.storagePrefix);
    }
}