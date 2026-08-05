import { SocialLogin as GoogleAndroidAuth } from "@capgo/capacitor-social-login";
import type { GoogleCredential } from "./GoogleAuthCredential";

let initialized = false;
export async function login(googleWebClientId:string) : Promise<GoogleCredential> {
    // Capgo
    if (!initialized)
    {
        await GoogleAndroidAuth.initialize({
            google: {
                webClientId: googleWebClientId, 
            },
        });
        initialized = true;
    }
    
    const res = await GoogleAndroidAuth.login({
        provider: 'google',
        options: { },
    });

    if (res.result.responseType !== "online" || !res.result.idToken) {
        throw new Error("Google login did not return an ID token.");
    }

    console.log(JSON.stringify(res));

    return { idToken: res.result.idToken }
}