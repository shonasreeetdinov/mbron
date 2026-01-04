/**
 * Production Environment Configuration
 * Used by both web and mobile applications in production mode
 */

export const environment = {
  production: true,

  // API Configuration
  api: {
    baseUrl: 'https://api.mbron.uz/api',
    timeout: 30000,
    version: 'v1',
  },

  // Feature Flags
  features: {
    auth: true,
    analytics: true,
    offline: true,
  },

  // Logging
  logging: {
    enabled: false,
    level: 'error',
  },

  // App Info
  app: {
    name: 'MBRON',
    version: '1.0.9',
  },
};
