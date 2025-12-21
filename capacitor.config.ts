// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mbron.app',
  appName: 'Mbron',
  webDir: 'dist/mobile',  // hozirgi build output joyingiz

  plugins: {
    LiveUpdates: {
      enabled: true,
      // Channel nomi (production, staging va h.k.)
      channel: 'production',
      // Auto download va apply (tavsiya etiladi)
      autoUpdateMethod: 'background'  // yoki 'none' (manual)
    }
  },

  server: {
    // OTA update uchun remote server yoqilgan bo‘lishi kerak
    hostname: 'mbron.vercel.app',
    androidScheme: 'https',
    allowNavigation: ['*']
  }
};

export default config;