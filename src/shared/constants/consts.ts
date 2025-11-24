// Common constants used across the application
export const APP_NAME = "Client User";
export const APP_VERSION = "1.0.0";

// API constants
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
export const AI_CHAT_API_URL =
  import.meta.env.VITE_AI_CHAT_API_URL ||
  "https://multivendorchatbot-production.up.railway.app/api/chat/";
export const API_TIMEOUT = 30000;

// Date formats
export const DATE_FORMAT = "DD/MM/YYYY";
export const DATETIME_FORMAT = "DD/MM/YYYY HH:mm:ss";

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Validation
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

// UI constants
export const ANIMATION_DURATION = 200;
export const DEBOUNCE_DELAY = 300;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error occurred",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  SERVER_ERROR: "Internal server error",
  VALIDATION_ERROR: "Validation error",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: "Saved successfully",
  DELETE_SUCCESS: "Deleted successfully",
  UPDATE_SUCCESS: "Updated successfully",
  CREATE_SUCCESS: "Created successfully",
} as const;

// Market constants
export const EMarketCodeNew = {
  HOSE: "HOSE",
  HNX: "HNX",
  UPCOM: "UPCOM",
  DER_IDX: "DER_IDX",
  HSX_IDX: "HSX_IDX",
  HNX_IDX: "HNX_IDX",
  UPCOM_IDX: "UPCOM_IDX",
} as const;

export const SecType = {
  STOCK: "STOCK",
  BOND: "BOND",
  FUND: "FUND",
  DERIVATIVE: "DERIVATIVE",
  CW: "CW",
  E: "E",
  D: "D",
} as const;

export const MarketType = {
  STOCK: "STOCK",
  BOND: "BOND",
  COMMODITY: "COMMODITY",
  FOREX: "FOREX",
  CRYPTO: "CRYPTO",
  DERIVATIVE: "DERIVATIVE",
} as const;
