import type { API } from "../api/API";
import type { UserDataRepository } from "../repositories/UserDataRepository";
import type { AuthService } from "./AuthService";

export class CloudUserDataSyncService {

    private readonly userDataRepository:UserDataRepository;
    private readonly authService:AuthService;
    private readonly api:API;

    constructor(userDataRepository:UserDataRepository, authService:AuthService, api:API) {
        this.userDataRepository = userDataRepository;
        this.authService = authService;
        this.api = api;
    }

    isAvailable() {
        return this.authService.isLoggedIn();
    }

    async sync(): Promise<boolean> {

        try {
            
            await this.uploadUserData();
            this.userDataRepository.clearPendingChanges();
            await this.downloadUserData();
            return true;

        } catch (e) {
            
            console.log("Cloud sync failed", e);
            return false;
        }
    }

    private async uploadUserData() {
        await this.api.setUserData(
            this.userDataRepository.getUserDataToUpload()
        );
    }

    private async downloadUserData() {
        const userData = await this.api.getUserData();
        console.log(JSON.stringify(userData));
        if (userData) {
            this.userDataRepository.setUserData(userData);
        }
    }
}