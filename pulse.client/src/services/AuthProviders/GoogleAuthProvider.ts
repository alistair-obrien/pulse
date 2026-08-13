import type { Platform } from "../../AppConfig";
import type { AuthProvider } from "../AuthService";

import * as GoogleAndroidAuth from "./Google/GoogleAndroidAuthProvider"
import * as GoogleiOSAuth from "./Google/GoogleiOSAuthProvider"
import * as GoogleWebAuth from "./Google/GoogleWebAuthProvider"

import type { GoogleCredential } from "./Google/GoogleAuthCredential";
import type { API, LoginResponse } from "../../api/API";

// >>> GOOFLE <<<
export class GoogleAuthProvider implements AuthProvider {
    readonly providerName: string = "google";
   
    private readonly googleWebClientId: string;
    private readonly userPlatform: string;
    private readonly api: API;

    constructor(googleWebClientId:string, userPlatform:Platform, api:API) {
        this.googleWebClientId = googleWebClientId;
        this.userPlatform = userPlatform;
        this.api = api;
    }

    async login() : Promise<LoginResponse> {

        let googleCredential:GoogleCredential = { }

        const clientId = this.googleWebClientId;

        if (!clientId)
            throw new Error("Google Web Client ID has not been configured.");

        switch (this.userPlatform) {
            case "android":
                googleCredential = await GoogleAndroidAuth.login(clientId);
                break;
            case "ios":
                googleCredential = await GoogleiOSAuth.login(clientId);
                break;
            case "web":
                googleCredential = await GoogleWebAuth.login(clientId);
                break;
            default:
                throw new Error(`Google login not supported on ${this.userPlatform}`);
        }

        return await this.completeGoogleLogin(googleCredential);
    }

    async completeGoogleLogin(googleCredential: GoogleCredential) : Promise<LoginResponse> {
        return await this.api.googleLogin(googleCredential);
    }
}