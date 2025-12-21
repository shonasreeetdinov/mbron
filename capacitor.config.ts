// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mbron.app',
  appName: 'Mbron',
  webDir: 'dist/mobile',  // yoki 'www' agar www ga build qilayotgan bo‘lsangiz

  // Serverdan yuklash uchun sozlamalar
  server: {
    hostname: 'mbron-app.vercel.app',  // ← Vercel yoki boshqa server domain'ingiz
    androidScheme: 'https',
    allowNavigation: [
      'mbron-app.vercel.app',
      '*.vercel.app'
    ]
  },

  // Muhim: WebView plugin qo'shilishi kerak
  plugins: {
    WebView: {
      // Bu yerda qo'shimcha sozlamalar bo‘lishi mumkin
    }
  }
};

export default config;