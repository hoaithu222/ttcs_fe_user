import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { v4 as uuidv4 } from "uuid";

import { MODE, API_TIMEOUT } from "@/app/config/env.config";
import { toastUtils } from "@/shared/utils/toast.utils";
import { AUTH_TOKENS_CHANGED_EVENT } from "@/shared/constants/events";

const emitAuthTokensChanged = (hasTokens: boolean) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(AUTH_TOKENS_CHANGED_EVENT, {
      detail: { hasTokens },
    })
  );
};

// Logout function - clear tokens and redirect
const logoutRequest = () => {
  console.log("Logout requested");
  // Clear tokens from localStorage
  tokenStorage.clearTokens();
  // Clear any other auth-related data
  localStorage.removeItem("persist:root");
  // Redirect to login page
  window.location.href = "/login";
};

// Simple token storage using localStorage
const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem("accessToken"),
  getRefreshToken: (): string | null => localStorage.getItem("refreshToken"),
  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    emitAuthTokensChanged(true);
  },
  clearTokens: (): void => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    emitAuthTokensChanged(false);
  },
  hasTokens: (): boolean => {
    return !!tokenStorage.getAccessToken();
  },
};

// Simple normalize function
const normalizeNullStringsDeep = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string" && obj === "null") return null;
  if (Array.isArray(obj)) return obj.map(normalizeNullStringsDeep);
  if (typeof obj === "object") {
    const normalized: any = {};
    for (const key in obj) {
      normalized[key] = normalizeNullStringsDeep(obj[key]);
    }
    return normalized;
  }
  return obj;
};

/** Mở rộng ErrorData để lưu thêm thông tin debug */
export interface ErrorData extends Error {
  code?: string;
  httpStatus?: number;
  requestId?: string;
  originalError?: any;
  description?: string;
}

/** Thêm metadata để lưu startTime và đếm retry */
interface MetaConfig extends InternalAxiosRequestConfig {
  metadata?: { startTime: number; retryStartTime?: number };
  _retryCount?: number;
  _retry?: boolean;
}

// Export token storage utilities
export { tokenStorage };

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// Process failed queue
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

export abstract class VpsHttpClient {
  protected instance: AxiosInstance;

  private readonly maxRetryCount = 2;
  private readonly maxRetryDurationMs = 2000; // tối đa 2 giây retry tổng

  constructor(baseURL: string) {
    if (!baseURL) {
      throw new Error("VpsHttpClient requires a valid baseURL");
    }

    this.instance = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
      timeout: API_TIMEOUT,
    });

    this.initializeInterceptors();
  }

  protected setBaseUrl(baseURL: string) {
    this.instance.defaults.baseURL = baseURL;
  }

  /** ----- Interceptors ----- */
  private initializeInterceptors() {
    // Bind methods to ensure proper 'this' context
    this.instance.interceptors.request.use(
      (req: MetaConfig) => this.handleRequest(req),
      (error: any) => this.handleRequestError(error)
    );
    this.instance.interceptors.response.use(
      (response: AxiosResponse<any>) => this.handleResponse(response),
      (error: any) => this.handleResponseError(error)
    );
  }

  private handleRequest(req: MetaConfig): MetaConfig {
    const headers = new axios.AxiosHeaders(req.headers);
    headers.set("x-request-id", uuidv4());
    headers.set("accept-language", localStorage.getItem("i18nextLng") || "vi");

    // Add access token to requests
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
      if (MODE === "dev") {
        console.log(`[VpsHttpClient] Adding Authorization header for ${req.method} ${req.url}`);
      }
    } else {
      console.warn(`[VpsHttpClient] No access token found for ${req.method} ${req.url}`);
    }

    req.headers = headers;
    req.metadata = { startTime: Date.now(), retryStartTime: Date.now() };
    return req;
  }

  private handleRequestError(error: any) {
    if (MODE === "dev") {
      console.error("[VpsHttpClient] Request error:", error);
    }
    return Promise.reject(error);
  }

  private handleResponse(response: AxiosResponse<any>): AxiosResponse<any> {
    const { config, data } = response;
    const { url } = config as MetaConfig;

    // Log response in dev mode
    if (MODE === "dev") {
      console.log(`[API Response] ${config.method?.toUpperCase()} ${url}:`, data);
    }

    // Check if response has error structure
    if (!data.success && data.success !== false) {
      // Old format with 'rc' field - normalize for backward compatibility
      const responseCode = data.code ?? data.rc;

      // If response code exists and not success (1), treat as error
      if (responseCode !== undefined && responseCode !== 1) {
        const errorMessage = data.message || data.rs || `Có lỗi xảy ra (${responseCode})`;
        const commonError = this.createError(response, {
          code: `ERROR_${responseCode}`,
          name: `ERROR_${responseCode}`,
          userMessage: errorMessage,
        });

        const isInvalidSession =
          data.message === "FOException.InvalidSessionException" ||
          data.rs === "FOException.InvalidSessionException";

        if (isInvalidSession) {
          setTimeout(() => {
            logoutRequest();
          }, 100);
        } else {
          toastUtils.error(errorMessage);
        }

        throw commonError;
      }
    }

    // Check for error responses with success: false
    if (data.success === false) {
      const errorMessage = data.message || "Có lỗi xảy ra";
      const errorCode = data.code || 0;

      const commonError = this.createError(response, {
        code: `ERROR_${errorCode}`,
        name: `ERROR_${errorCode}`,
        userMessage: errorMessage,
      });

      // Don't show toast if skipToast flag is set
      if (!data.skipToast) {
        toastUtils.error(errorMessage);
      }

      throw commonError;
    }

    // Normalize response data for successful responses
    response.data = normalizeNullStringsDeep(response.data);
    return response;
  }

  private async handleResponseError(error: any) {
    const { response, config } = error;
    const originalRequest = config as MetaConfig;

    // Log error in dev mode
    if (MODE === "dev") {
      console.error("[VpsHttpClient] Response error:", error);
    }

    // Check if response has standard error format with skipToast flag
    if (response?.data && typeof response.data === "object" && !Array.isArray(response.data)) {
      const errorData = response.data as any;

      // Check if this is a standard error response
      if (errorData.success === false || errorData.hasOwnProperty("success")) {
        // Log error response in dev mode
        if (MODE === "dev") {
          console.log("[VpsHttpClient] Standard error response:", errorData);
        }

        const message = errorData.message || "An error occurred";

        // Only show toast if skipToast is not true
        if (!errorData.skipToast) {
          toastUtils.error(message);
          if (MODE === "dev") {
            console.log("[VpsHttpClient] Showing toast for error:", message);
          }
        } else {
          if (MODE === "dev") {
            console.log("[VpsHttpClient] Skipping toast for error:", message);
          }
        }

        // Create standardized error object
        const standardError: ErrorData = {
          message: message,
          name: "API_ERROR",
          code: `ERROR_${errorData.code || response?.status}`,
          httpStatus: response?.status,
          requestId: config?.headers?.["x-request-id"] as string,
          originalError: error,
        };

        return Promise.reject(standardError);
      }
    }

    // Handle 401 Unauthorized - Token refresh logic
    if (response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (!this.instance) {
              throw new Error("Cannot retry queued request: instance is null");
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.instance.request(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh token API - dynamic import to avoid circular dependency
        const { authAPI } = await import("@/core/api/auth");
        const refreshResponse = await authAPI.refreshToken(refreshToken);

        if (!refreshResponse || !refreshResponse.data) {
          throw new Error("Invalid refresh token response");
        }

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        // Update stored tokens
        tokenStorage.setTokens(accessToken, newRefreshToken);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken);

        // Retry the original request
        if (!this.instance) {
          throw new Error("Cannot retry request: instance is null");
        }
        return this.instance.request(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        tokenStorage.clearTokens();
        processQueue(refreshError, null);

        // Redirect to login page or dispatch logout action
        setTimeout(() => {
          logoutRequest();
        }, 100);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle retry logic for server errors
    const status = response?.status;
    const shouldRetry = !response || (status >= 500 && status < 600);
    if (shouldRetry && (originalRequest._retryCount ?? 0) < this.maxRetryCount) {
      const now = Date.now();
      const retryElapsed = now - (originalRequest.metadata?.retryStartTime || now);

      if (retryElapsed < this.maxRetryDurationMs) {
        originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;
        await this.delay(300 * originalRequest._retryCount);
        return this.instance.request(config);
      }
    }

    // Handle non-standard error responses (network errors, etc.)
    const errData = (response?.data as Partial<ErrorData>) || {};
    const serverCode = errData.code;
    const clientCode =
      !status || (status >= 500 && status < 600)
        ? "error.errorServer"
        : serverCode
          ? `error.${serverCode}`
          : "";

    // Show toast for network/server errors
    if (status) {
      if (status >= 500 && status < 600) {
        toastUtils.error("Server error occurred. Please try again later.");
      } else if (status === 0 || !status) {
        toastUtils.error("Network error. Please check your connection.");
      }
    }

    const errorData: ErrorData = {
      httpStatus: status,
      requestId: config?.headers?.["x-request-id"] as string,
      message: errData.message || String(status),
      code: clientCode,
      name: errData.name || "ERROR",
      originalError: error,
    };
    return Promise.reject(errorData);
  }

  /** Helper để tạo ErrorData chuẩn */
  private createError(
    response: AxiosResponse<any>,
    opts: {
      code: string;
      name: string;
      userMessage?: string;
    }
  ): ErrorData {
    const { code, name, userMessage } = opts;
    const { status, config } = response;
    const requestId = (config.headers as any)["x-request-id"] as string;

    return {
      httpStatus: status || 200,
      requestId,
      message: userMessage ?? name,
      code,
      name,
      originalError: response,
    };
  }

  /** ----- Helpers ----- */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** ----- Public API methods (trả về nguyên response, không phải chỉ data) ----- */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    if (!this.instance) {
      throw new Error("VpsHttpClient instance is not initialized. Cannot make GET request.");
    }
    return this.instance.get<T>(url, config);
  }

  public async post<T = any, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    if (!this.instance) {
      throw new Error("VpsHttpClient instance is not initialized. Cannot make POST request.");
    }
    return this.instance.post<T>(url, data, config);
  }

  public async put<T = any, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    if (!this.instance) {
      throw new Error("VpsHttpClient instance is not initialized. Cannot make PUT request.");
    }
    return this.instance.put<T>(url, data, config);
  }

  public async patch<T = any, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    if (!this.instance) {
      throw new Error("VpsHttpClient instance is not initialized. Cannot make PATCH request.");
    }
    return this.instance.patch<T>(url, data, config);
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    if (!this.instance) {
      throw new Error("VpsHttpClient instance is not initialized. Cannot make DELETE request.");
    }
    return this.instance.delete<T>(url, config);
  }
}
