/**
 * Development Environment Configuration
 * Used by both web and mobile applications in development mode
 */

export const environment = {
  production: false,

  // API Configuration
  api: {
    baseUrl: 'https://api-test.mbron.uz/api',
    timeout: 300000, // 3 minutes
    version: 'v1',
  },

  // Feature Flags
  features: {
    auth: true,
    analytics: false,
    offline: true,
  },

  // Logging
  logging: {
    enabled: true,
    level: 'debug',
  },

  // App Info
  app: {
    name: 'MBRON',
    version: '1.0.4',
  },
};
