// Toast utility functions
export const toastUtils = {
  /**
   * Show success toast
   */
  success: (message: string, _duration: number = 3000): void => {
    // Implementation would depend on your toast library
    console.log(`Success: ${message}`);
  },

  /**
   * Show error toast
   */
  error: (message: string, _duration: number = 5000): void => {
    console.error(`Error: ${message}`);
  },

  /**
   * Show warning toast
   */
  warning: (message: string, _duration: number = 4000): void => {
    console.warn(`Warning: ${message}`);
  },

  /**
   * Show info toast
   */
  info: (message: string, _duration: number = 3000): void => {
    console.info(`Info: ${message}`);
  },

  /**
   * Show loading toast
   */
  loading: (message: string): string => {
    const id = Math.random().toString(36).substr(2, 9);
    console.log(`Loading: ${message} (ID: ${id})`);
    return id;
  },

  /**
   * Dismiss toast by ID
   */
  dismiss: (id: string): void => {
    console.log(`Dismissed toast: ${id}`);
  },

  /**
   * Clear all toasts
   */
  clear: (): void => {
    console.log("Cleared all toasts");
  },

  /**
   * Show toast with custom options
   */
  custom: (
    message: string,
    options: {
      type?: "success" | "error" | "warning" | "info";
      duration?: number;
      position?: "top" | "bottom" | "center";
      action?: {
        label: string;
        onClick: () => void;
      };
    } = {}
  ): void => {
    const { type = "info", duration = 3000, position = "top", action } = options;
    console.log(`Custom toast [${type}]: ${message}`, { duration, position, action });
  },

  /**
   * Show toast by error code
   */
  showToastByCode: (code: string): void => {
    const errorMessages: Record<string, string> = {
      NETWORK_ERROR: "Network error occurred",
      UNAUTHORIZED: "Unauthorized access",
      FORBIDDEN: "Access forbidden",
      NOT_FOUND: "Resource not found",
      SERVER_ERROR: "Internal server error",
      VALIDATION_ERROR: "Validation error",
    };

    const message = errorMessages[code] || "An error occurred";
    toastUtils.error(message);
  },

  /**
   * Translation keys for toast messages
   */
  TranslationKeys: {
    SUCCESS: "toast.success",
    ERROR: "toast.error",
    WARNING: "toast.warning",
    INFO: "toast.info",
    NETWORK_ERROR: "toast.network_error",
    UNAUTHORIZED: "toast.unauthorized",
    FORBIDDEN: "toast.forbidden",
    NOT_FOUND: "toast.not_found",
    SERVER_ERROR: "toast.server_error",
    VALIDATION_ERROR: "toast.validation_error",
  },
};

// Export individual functions for easier imports
export const { success, error, warning, info, clear, custom, showToastByCode, TranslationKeys } =
  toastUtils;
