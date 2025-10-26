import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { v4 as uuidv4 } from "uuid";

import { MODE, API_TIMEOUT } from "@/app/config/env.config";
import { USER_AUTH_ENDPOINTS, USER_OTP_ENDPOINTS } from "@/core/api/auth/path";
import { USER_PRODUCTS_ENDPOINTS } from "@/core/api/products/path";
import authApi from "@/core/api/auth";
import { toastUtils } from "@/shared/utils/toast.utils";

// Mock logout function - replace with actual implementation
const logoutRequest = () => {
  console.log("Logout requested");
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
  },
  clearTokens: (): void => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
  hasTokens: (): boolean => {
    return !!(tokenStorage.getAccessToken() && tokenStorage.getRefreshToken());
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

export abstract class UserHttpClient {
  protected instance: AxiosInstance;

  private readonly maxRetryCount = 2;
  private readonly maxRetryDurationMs = 2000; // tối đa 2 giây retry tổng

  constructor(baseURL: string) {
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
    this.instance.interceptors.request.use(this.handleRequest, this.handleRequestError);
    this.instance.interceptors.response.use(this.handleResponse, this.handleResponseError);
  }

  private handleRequest = (req: MetaConfig): MetaConfig => {
    const headers = new axios.AxiosHeaders(req.headers);
    headers.set("x-request-id", uuidv4());
    headers.set("accept-language", localStorage.getItem("i18nextLng") || "vi");

    // Add access token to requests
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    req.headers = headers;
    req.metadata = { startTime: Date.now(), retryStartTime: Date.now() };
    return req;
  };

  private handleRequestError = (error: any) => {
    if (MODE === "dev") {
      console.error("[UserHttpClient] Request error:", error);
    }
    return Promise.reject(error);
  };

  private shouldBypassRcValidation(url: string | undefined): boolean {
    if (!url) return false;
    // Bypass RC validation for auth, OTP, and products endpoints
    return (
      Object.values(USER_AUTH_ENDPOINTS).some((path) => url === path) ||
      Object.values(USER_OTP_ENDPOINTS).some((path) => url === path) ||
      Object.values(USER_PRODUCTS_ENDPOINTS).some((path) => url.includes(path.replace(":id", "")))
    );
  }

  private handleResponse = (response: AxiosResponse<any>): AxiosResponse<any> => {
    const { config, data } = response;
    const { url } = config as MetaConfig;

    // Log response in dev mode
    if (MODE === "dev") {
      console.log(`[API Response] ${config.method?.toUpperCase()} ${url}:`, data);
    }

    // Handle dummy data
    if (data?.data?.[0]?.DUMMY === "X") {
      throw this.createError(response, {
        code: "ERROR_DUMMY_DATA",
        name: "ERROR_DUMMY_DATA",
        userMessage: "Dữ liệu không hợp lệ",
      });
    }

    // Handle special RC codes
    if (data?.rc === -6017) {
      response.data = normalizeNullStringsDeep(response.data);
      data.rc = 1;
      return response;
    }

    // RC validation (bypass for auth endpoints)
    if (!this.shouldBypassRcValidation(url) && data?.rc !== 1) {
      const isInvalidSession = data.rs === "FOException.InvalidSessionException";

      if (isInvalidSession) {
        setTimeout(() => {
          logoutRequest();
        }, 100);
      }

      const errorMessage = data.rs || `Có lỗi xảy ra (${data.rc})`;
      const commonError = this.createError(response, {
        code: `ERROR_${data.rc}`,
        name: `ERROR_${data.rc}`,
        userMessage: errorMessage,
      });

      if (!isInvalidSession) {
        toastUtils.error(errorMessage);
      }

      throw commonError;
    }

    // Normalize response data
    response.data = normalizeNullStringsDeep(response.data);
    return response;
  };

  private handleResponseError = async (error: any) => {
    const { response, config } = error;
    const originalRequest = config as MetaConfig;

    // Handle 401 Unauthorized - Token refresh logic
    if (response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
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

        // Call refresh token API
        const response = await authApi.refreshToken(refreshToken);
        const refreshData = response.data;

        if (!refreshData) {
          throw new Error("Invalid refresh token response");
        }

        const { accessToken, refreshToken: newRefreshToken } = refreshData;

        // Update stored tokens
        tokenStorage.setTokens(accessToken, newRefreshToken);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken);

        // Retry the original request
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

    if (MODE === "dev") {
      console.error("[UserHttpClient] Response error:", error);
    }

    const errData = (response?.data as Partial<ErrorData>) || {};
    const serverCode = errData.code;
    const clientCode =
      !status || (status >= 500 && status < 600)
        ? "error.errorServer"
        : serverCode
          ? `error.${serverCode}`
          : "";

    const errorData: ErrorData = {
      httpStatus: status,
      requestId: config.headers["x-request-id"] as string,
      message: errData.message || String(status),
      code: clientCode,
      name: errData.name || "ERROR",
      originalError: error,
    };
    return Promise.reject(errorData);
  };

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
    return this.instance.get<T>(url, config);
  }

  public async post<T = any, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  public async put<T = any, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  public async patch<T = any, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }
}
