// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mbron.new',
  appName: 'MBRON',
  webDir: 'dist/mobile/browser',

  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['mbron.vercel.app', 'https://mbron.vercel.app'],
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
