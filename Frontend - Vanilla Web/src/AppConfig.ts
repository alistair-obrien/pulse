
export interface AppConfig {
    readonly appSource: string;
    readonly platform: string;
    readonly environment: string;
    readonly apiBase: string;
    readonly versionNumber: string;
    readonly splashEnabled: boolean;
    readonly showDebugVersionAnnotation: boolean;
    readonly socialLoginIds: SocialLoginIds;
}

export interface SocialLoginIds {
    readonly googleWebClientId: string; // For android and web
}