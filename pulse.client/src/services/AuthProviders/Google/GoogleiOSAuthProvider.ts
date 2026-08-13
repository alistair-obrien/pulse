import { SocialLogin } from "@capgo/capacitor-social-login";
import type { GoogleCredential } from "./GoogleAuthCredential";

let initialized = false;
export async function login(iOSClientId:string) : Promise<GoogleCredential> {
    // Capgo
    if (!initialized)
    {
        await SocialLogin.initialize({
            google: {
                iOSClientId: iOSClientId,
                mode: "online"
            },
        });
        initialized = true;
    }
    
    const res = await SocialLogin.login({
        provider: 'google',
        options: { },
    });

    if (res.result.responseType !== "online" || !res.result.idToken) {
        throw new Error("Google login did not return an ID token.");
    }

    console.log(JSON.stringify(res));

    return { idToken: res.result.idToken }
}