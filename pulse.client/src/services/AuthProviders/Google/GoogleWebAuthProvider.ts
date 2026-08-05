import type { GoogleCredential } from "./GoogleAuthCredential";

let GoogleWebAuth = false;

let codeClient: google.accounts.oauth2.CodeClient;

let pendingResolve: ((code: GoogleCredential) => void) | null = null;
let pendingReject: ((reason?: any) => void) | null = null;

export async function login(clientId: string): Promise<GoogleCredential> {
    await ensureInitialized(clientId);

    return new Promise((resolve, reject) => {
        pendingResolve = resolve;
        pendingReject = reject;

        codeClient.requestCode();
    });
}

async function ensureInitialized(clientId: string): Promise<void> {
    if (GoogleWebAuth)
        return;

    await loadGoogleSdk();

    codeClient = google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: "openid email profile",
        ux_mode: "popup",
        callback: handleCodeResponse,
    });

    GoogleWebAuth = true;
}

function handleCodeResponse(response: google.accounts.oauth2.CodeResponse) {
    if (response.error) {
        pendingReject?.(new Error(response.error));
    } else if (!response.code) {
        pendingReject?.(new Error("No authorization code returned."));
    } else {
        pendingResolve?.({ authorizationCode: response.code });
    }

    pendingResolve = null;
    pendingReject = null;
}

function loadGoogleSdk(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.oauth2) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Identity Services."));

        document.head.appendChild(script);
    });
}