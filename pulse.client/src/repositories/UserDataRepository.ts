import type { AppConfig } from "../AppConfig";
import type { UserData } from "./UserDataRepository/UserData";
import { UserDataStore } from "./UserDataRepository/UserDataStore";

export class UserDataRepository {

    private readonly localStore: UserDataStore;
    private readonly cloudStore: UserDataStore;

    constructor(appConfig: AppConfig, userId: string) {
        const prefix = `pulse_${appConfig.environment}:${userId}`;

        this.localStore = new UserDataStore(`${prefix}:local`);
        this.cloudStore = new UserDataStore(`${prefix}:cloud`);
    }

    getUserData(): UserData {
        return {
            displayName:
                this.localStore.get("displayName")
                ?? this.cloudStore.get("displayName"),

            profileImage:
                this.localStore.get("profileImage")
                ?? this.cloudStore.get("profileImage")
        };
    }

    getUserDataToUpload(): UserData {
        return this.localStore.getAll();
    }

    setUserData(userData: UserData) {
        this.cloudStore.setAll(userData);
    }

    setDisplayName(displayName: string) {
        this.localStore.set("displayName", displayName);
    }

    setProfileImage(profileImage: string) {
        this.localStore.set("profileImage", profileImage);
    }

    clearPendingChanges() {
        this.localStore.clear();
    }
}