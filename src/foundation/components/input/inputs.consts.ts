// Input component constants
export const INPUT_CONSTANTS = {
  // Input types
  TYPES: {
    TEXT: "text",
    EMAIL: "email",
    PASSWORD: "password",
    NUMBER: "number",
    TEL: "tel",
    URL: "url",
    SEARCH: "search",
    DATE: "date",
    TIME: "time",
    DATETIME_LOCAL: "datetime-local",
    MONTH: "month",
    WEEK: "week",
    COLOR: "color",
    FILE: "file",
    HIDDEN: "hidden",
  },

  // Input sizes
  SIZES: {
    SMALL: "sm",
    MEDIUM: "md",
    LARGE: "lg",
  },

  // Input variants
  VARIANTS: {
    DEFAULT: "default",
    OUTLINED: "outlined",
    FILLED: "filled",
    UNDERLINED: "underlined",
  },

  // Input states
  STATES: {
    DEFAULT: "default",
    ERROR: "error",
    SUCCESS: "success",
    WARNING: "warning",
    DISABLED: "disabled",
  },

  // Validation patterns
  PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    NUMERIC: /^\d+$/,
    DECIMAL: /^\d*\.?\d+$/,
  },

  // Error messages
  ERROR_MESSAGES: {
    REQUIRED: "This field is required",
    INVALID_EMAIL: "Please enter a valid email address",
    INVALID_PHONE: "Please enter a valid phone number",
    INVALID_URL: "Please enter a valid URL",
    WEAK_PASSWORD: "Password must be at least 8 characters with uppercase, lowercase, and number",
    INVALID_USERNAME:
      "Username must be 3-20 characters and contain only letters, numbers, and underscores",
    MIN_LENGTH: "Minimum length is {min} characters",
    MAX_LENGTH: "Maximum length is {max} characters",
    MIN_VALUE: "Minimum value is {min}",
    MAX_VALUE: "Maximum value is {max}",
    PATTERN_MISMATCH: "Please enter a valid value",
    CUSTOM: "Please enter a valid value",
  },

  // Default values
  DEFAULTS: {
    PLACEHOLDER: "Enter value...",
    LABEL: "Input",
    HELPER_TEXT: "",
    ERROR_TEXT: "",
    MIN_LENGTH: 0,
    MAX_LENGTH: 255,
    MIN_VALUE: Number.MIN_SAFE_INTEGER,
    MAX_VALUE: Number.MAX_SAFE_INTEGER,
    STEP: 1,
    AUTOCOMPLETE: "off",
    SPELLCHECK: false,
    AUTOCAPITALIZE: "off",
    AUTOCORRECT: "off",
  },

  // Animation durations
  ANIMATIONS: {
    FOCUS_DURATION: 200,
    BLUR_DURATION: 200,
    ERROR_DURATION: 300,
    SUCCESS_DURATION: 300,
  },

  // Icon sizes
  ICON_SIZES: {
    SMALL: "w-4 h-4",
    MEDIUM: "w-5 h-5",
    LARGE: "w-6 h-6",
  },

  // Spacing
  SPACING: {
    SMALL: "p-2",
    MEDIUM: "p-3",
    LARGE: "p-4",
  },

  // Border radius
  BORDER_RADIUS: {
    SMALL: "rounded-sm",
    MEDIUM: "rounded-md",
    LARGE: "rounded-lg",
    FULL: "rounded-full",
  },

  // Focus styles
  FOCUS_STYLES: {
    RING: "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    OUTLINE: "focus:outline-none",
    BORDER: "focus:border-blue-500",
  },

  // Disabled styles
  DISABLED_STYLES: {
    OPACITY: "opacity-50",
    CURSOR: "cursor-not-allowed",
    BACKGROUND: "bg-gray-100",
  },

  // Error styles
  ERROR_STYLES: {
    BORDER: "border-red-500",
    TEXT: "text-red-600",
    BACKGROUND: "bg-red-50",
    RING: "ring-red-500",
  },

  // Success styles
  SUCCESS_STYLES: {
    BORDER: "border-green-500",
    TEXT: "text-green-600",
    BACKGROUND: "bg-green-50",
    RING: "ring-green-500",
  },

  // Warning styles
  WARNING_STYLES: {
    BORDER: "border-yellow-500",
    TEXT: "text-yellow-600",
    BACKGROUND: "bg-yellow-50",
    RING: "ring-yellow-500",
  },
};

// Export individual constants for backward compatibility
export const InputSize = INPUT_CONSTANTS.SIZES;
export const INPUT_SIZE = INPUT_CONSTANTS.SIZES;
export const TEXT_SIZE = INPUT_CONSTANTS.SIZES;

// Size mapping for backward compatibility
export const SIZE_MAPPING = {
  small: INPUT_CONSTANTS.SIZES.SMALL,
  medium: INPUT_CONSTANTS.SIZES.MEDIUM,
  large: INPUT_CONSTANTS.SIZES.LARGE,
  sm: INPUT_CONSTANTS.SIZES.SMALL,
  md: INPUT_CONSTANTS.SIZES.MEDIUM,
  lg: INPUT_CONSTANTS.SIZES.LARGE,
};

// Helper function to get size class
export const getSizeClass = (size: string): string => {
  return SIZE_MAPPING[size as keyof typeof SIZE_MAPPING] || INPUT_CONSTANTS.SIZES.MEDIUM;
};

// Base CSS classes
export const BASE_INPUT_CLASS =
  "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
export const BASE_INPUT_CLASS_ACTION =
  "w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
export const BASE_POSITION_CLASS = "relative";
export const DISABLED_INPUT_CLASS = "opacity-50 cursor-not-allowed bg-gray-100";
export const ERROR_INPUT_CLASS = "border-red-500 focus:ring-red-500 focus:border-red-500";
export const ERROR_TEXT_CLASS = "text-red-600 text-sm mt-1";
