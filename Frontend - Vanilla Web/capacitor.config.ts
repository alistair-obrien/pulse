import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pixeldust.pulse',
  appName: 'Pulse',
  webDir: process.env.PULSE_WEB_DIR ??'../publish/client/unknown/unknown'
};

export default config;
