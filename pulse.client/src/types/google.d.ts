/// <reference types="google.accounts" />

declare global {
    const google: typeof import("google.accounts").google;

    interface Window {
        google: typeof google;
    }
}

export {};