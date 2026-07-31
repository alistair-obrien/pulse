import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pixeldust.pulse',
  appName: 'Pulse',
  webDir: process.env.PULSE_WEB_DIR ?? "dist",
  plugins: {
    SocialLogin: {
      providers: {
        google: true,      // true = enabled (bundled), false = disabled (not bundled)
        facebook: true,   // Use false to reduce app size
        apple: true,      // Apple uses system APIs, no external deps
        twitter: true   // false = disabled (not bundled)
      },
      logLevel: 1 // Warnings and errors only
    }
  }
};

console.log("webDir =", process.env.PULSE_WEB_DIR);

export default config;