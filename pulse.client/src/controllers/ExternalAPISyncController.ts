import * as HEVY from "../platform/hevy"

export async function sync(date: Date) : Promise<boolean> {
    try {
        HEVY.sync(date);
        return true;
    } catch (e) {
        console.log("HEVY sync failed", e);
        return false;
    }
}