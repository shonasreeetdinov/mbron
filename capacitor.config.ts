// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mbron.app',
  appName: 'Mbron',
  webDir: 'dist/mobile', // yoki 'www' agar www ga build qilayotgan bo‘lsangiz

  // Serverdan yuklash uchun sozlamalar
  server: {
    hostname: 'mbron.vercel.app',
    androidScheme: 'https',
    allowNavigation: ['mbron.vercel.app', '*.vercel.app'],
  },
  plugins: {
    WebView: {},
  },
};

export default config;
