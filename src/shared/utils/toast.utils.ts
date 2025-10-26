import { store } from "@/app/store";
import { addToast, removeToast, clearAllToasts } from "@/app/store/slices/toast";

/**
 * Toast utility functions to dispatch toast messages to Redux store
 */
export const toastUtils = {
  /**
   * Show success toast
   */
  success: (message: string, duration: number = 3000): void => {
    store.dispatch(
      addToast({
        type: "success",
        message,
        duration,
      })
    );
  },

  /**
   * Show error toast
   */
  error: (message: string, duration: number = 5000): void => {
    store.dispatch(
      addToast({
        type: "error",
        message,
        duration,
      })
    );
  },

  /**
   * Show warning toast
   */
  warning: (message: string, duration: number = 4000): void => {
    store.dispatch(
      addToast({
        type: "warning",
        message,
        duration,
      })
    );
  },

  /**
   * Show info toast
   */
  info: (message: string, duration: number = 3000): void => {
    store.dispatch(
      addToast({
        type: "info",
        message,
        duration,
      })
    );
  },

  /**
   * Show loading toast
   */
  loading: (message: string): string => {
    const id = Math.random().toString(36).substr(2, 9);
    store.dispatch(
      addToast({
        id,
        type: "info",
        message,
        duration: 0, // Don't auto-dismiss loading toasts
      })
    );
    return id;
  },

  /**
   * Dismiss toast by ID
   */
  dismiss: (id: string): void => {
    store.dispatch(removeToast(id));
  },

  /**
   * Clear all toasts
   */
  clear: (): void => {
    store.dispatch(clearAllToasts());
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
    const { type = "info", duration = 3000 } = options;
    store.dispatch(
      addToast({
        type,
        message,
        duration,
      })
    );
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
