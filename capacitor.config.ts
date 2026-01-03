// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mbron.new',
  appName: 'MBRON',
  webDir: 'dist/mobile/browser',

  server: {
    androidScheme: 'https',
    cleartext: true,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
