import fs from "fs";

const environment = process.argv[2];

if (!environment) {
    console.error("Missing environment.");
    process.exit(1);
}

const config = `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: "com.pixeldust.pulse",
    appName: "Pulse",
    webDir: "../publish/web/${environment}",
};

export default config;
`;

fs.writeFileSync("capacitor.config.ts", config);

console.log(`Capacitor configured for '${environment}'.`);