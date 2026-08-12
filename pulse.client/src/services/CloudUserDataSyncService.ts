import type { API } from "../api/API";
import type { UserSession } from "../UserSession";
import type { AuthService } from "./AuthService";

export class CloudUserDataSyncService {

    private readonly userSession:UserSession;
    private readonly authService:AuthService;
    private readonly api:API;

    constructor(userSession:UserSession, authService:AuthService, api:API) {
        this.userSession = userSession;
        this.authService = authService;
        this.api = api;
    }

    isAvailable() {
        return this.authService.isLoggedIn();
    }

    async sync(): Promise<boolean> {

        try {
            
            await this.uploadUserData();
            this.userSession.userData.clearPendingChanges();
            await this.downloadUserData();
            return true;

        } catch (e) {
            
            console.log("Cloud sync failed", e);
            return false;
        }
    }

    private async uploadUserData() {
        await this.api.setUserData(
            this.userSession.userData.getUserDataToUpload()
        );
    }

    private async downloadUserData() {
        const userData = await this.api.getUserData();
        console.log(JSON.stringify(userData));
        if (userData) {
            this.userSession.userData.setUserData(userData);
        }
    }
}