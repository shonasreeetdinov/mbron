// src/environments/environment.ts (Development uchun)
export const environment = {
  production: false,
  
  // API endpoints
  apiUrl: 'https://mbron.vercel.app/api',
  versionCheckUrl: 'https://mbron.vercel.app/api/version',
  
  // App metadata (build script tomonidan avtomatik yangilanadi)
  appMetadata: {
    version: '1.0.4',
    build: 104,
    buildDate: '2025-12-21T10:00:00Z'
  },
  
  // Feature flags
  features: {
    enableAnalytics: false,
    enableCrashReporting: false,
    enableAutoUpdate: true,
    enableDebugMode: true
  },
  
  // Update settings
  updateCheck: {
    intervalMinutes: 10,
    retryAttempts: 3,
    retryDelayMs: 5000
  },
  
  // Logging
  logging: {
    level: 'debug', // 'debug' | 'info' | 'warn' | 'error'
    enableConsole: true
  }
};