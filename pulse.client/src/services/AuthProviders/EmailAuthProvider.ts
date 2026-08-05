import type { API, EmailLoginRequest, EmailRegisterRequest, LoginResponse } from "../../api/API";

export class EmailAuthProvider {
    readonly providerName: string = "email";
   
    private readonly api:API;

    constructor(api:API) {
        this.api = api;
    }

    async registerEmail(request: EmailRegisterRequest): Promise<void> {
        return await this.api.register(request);
    }

    async loginEmail(request: EmailLoginRequest): Promise<LoginResponse> {
        return await this.api.emailLogin(request);
    }
}