export const MODE = import.meta.env.MODE;

// Environment configuration
export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,

  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || "Client User",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  APP_ENV: import.meta.env.VITE_APP_ENV || "development",

  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === "true",
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === "true",

  // UI Configuration
  DEFAULT_LANGUAGE: import.meta.env.VITE_DEFAULT_LANGUAGE || "en",
  DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || "light",

  // Animation Configuration
  BLINK_TIME: Number(import.meta.env.VITE_BLINK_TIME) || 1000,
  ANIMATION_DURATION: Number(import.meta.env.VITE_ANIMATION_DURATION) || 200,

  // Pagination
  DEFAULT_PAGE_SIZE: Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20,
  MAX_PAGE_SIZE: Number(import.meta.env.VITE_MAX_PAGE_SIZE) || 100,

  // Cache Configuration
  CACHE_TTL: Number(import.meta.env.VITE_CACHE_TTL) || 300000, // 5 minutes

  // Security
  JWT_SECRET: import.meta.env.VITE_JWT_SECRET || "your-secret-key",
  ENCRYPTION_KEY: import.meta.env.VITE_ENCRYPTION_KEY || "your-encryption-key",

  // External Services
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,

  // Development
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  IS_TEST: import.meta.env.MODE === "test",
} as const;

// Export individual values for convenience
export const {
  API_BASE_URL,
  API_TIMEOUT,
  APP_NAME,
  APP_VERSION,
  APP_ENV,
  ENABLE_ANALYTICS,
  ENABLE_DEBUG,
  ENABLE_MOCK_DATA,
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  BLINK_TIME,
  ANIMATION_DURATION,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  CACHE_TTL,
  JWT_SECRET,
  ENCRYPTION_KEY,
  GOOGLE_ANALYTICS_ID,
  SENTRY_DSN,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  IS_TEST,
} = ENV_CONFIG;
