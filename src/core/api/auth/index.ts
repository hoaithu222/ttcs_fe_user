import { USER_AUTH_ENDPOINTS, USER_OTP_ENDPOINTS, USER_SOCIAL_AUTH_ENDPOINTS } from "./path";
import type {
  RegisterUserRequest,
  LoginRequest,
  ResendVerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  OtpRequest,
  OtpVerifyRequest,
  LoginResponseData,
  RegisterResponseData,
  SimpleMessageData,
  SocialLoginResponseData,
  User,
  ApiSuccess,
  RefreshTokenResponse,
} from "./type";
import { VpsHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Authentication API service for users
class UserAuthApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Register new user
  async register(userData: RegisterUserRequest): Promise<ApiSuccess<RegisterResponseData>> {
    const response = await this.post(USER_AUTH_ENDPOINTS.REGISTER, userData);
    return response.data;
  }

  // Verify email with token
  async verifyEmail(token: string): Promise<ApiSuccess<SimpleMessageData>> {
    const response = await this.get(USER_AUTH_ENDPOINTS.VERIFY_EMAIL, {
      params: { token },
    });
    return response.data;
  }

  // Resend verification email
  async resendVerifyEmail(data: ResendVerifyEmailRequest): Promise<ApiSuccess<SimpleMessageData>> {
    const response = await this.post(USER_AUTH_ENDPOINTS.RESEND_VERIFY_EMAIL, data);
    return response.data;
  }

  // Login user
  async login(credentials: LoginRequest): Promise<ApiSuccess<LoginResponseData>> {
    const response = await this.post(USER_AUTH_ENDPOINTS.LOGIN, credentials);
    return response.data;
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiSuccess<SimpleMessageData>> {
    const response = await this.post(USER_AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
    return response.data;
  }

  // Reset password
  async resetPassword(data: ResetPasswordRequest): Promise<ApiSuccess<SimpleMessageData>> {
    const response = await this.post(USER_AUTH_ENDPOINTS.RESET_PASSWORD, data);
    return response.data;
  }

  // Logout user
  async logout(): Promise<ApiSuccess<void>> {
    // Prefer using the current access token for logout to match backend expectations
    const accessToken = localStorage.getItem("accessToken");
    const payload = accessToken ? { token: accessToken } : undefined;

    const response = await this.post(USER_AUTH_ENDPOINTS.LOGOUT, payload);
    return response.data;
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<ApiSuccess<RefreshTokenResponse>> {
    const response = await this.post(USER_AUTH_ENDPOINTS.REFRESH_TOKEN, {
      refreshToken,
    });
    return response.data;
  }

  // Get user profile
  async getProfile(): Promise<ApiSuccess<User>> {
    const response = await this.get(USER_AUTH_ENDPOINTS.PROFILE);
    return response.data;
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<ApiSuccess<User>> {
    const response = await this.put(USER_AUTH_ENDPOINTS.UPDATE_PROFILE, userData);
    return response.data;
  }

  // Change password
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    otp?: string;
    otpPurpose?: string;
    smartOtpPassword?: string;
  }): Promise<ApiSuccess<void>> {
    const response = await this.post(USER_AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
    return response.data;
  }
}

// OTP API service for users
class UserOtpApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Request OTP
  async request(data: OtpRequest): Promise<ApiSuccess<SimpleMessageData>> {
    const response = await this.post(USER_OTP_ENDPOINTS.REQUEST, data);
    return response.data;
  }

  // Verify OTP
  async verify(data: OtpVerifyRequest): Promise<ApiSuccess<SimpleMessageData>> {
    const response = await this.post(USER_OTP_ENDPOINTS.VERIFY, data);
    return response.data;
  }
}

// Social Authentication API service for users
class UserSocialAuthApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Google OAuth
  google = {
    login: (): string => {
      // Return Google OAuth URL for redirect
      return `${API_BASE_URL}${USER_SOCIAL_AUTH_ENDPOINTS.GOOGLE}`;
    },
    callback: async (): Promise<ApiSuccess<SocialLoginResponseData>> => {
      const response = await this.get(USER_SOCIAL_AUTH_ENDPOINTS.GOOGLE_CALLBACK);
      return response.data;
    },
  };

  // Facebook OAuth
  facebook = {
    login: (): string => {
      // Return Facebook OAuth URL for redirect
      return `${API_BASE_URL}${USER_SOCIAL_AUTH_ENDPOINTS.FACEBOOK}`;
    },
    callback: async (): Promise<ApiSuccess<SocialLoginResponseData>> => {
      const response = await this.get(USER_SOCIAL_AUTH_ENDPOINTS.FACEBOOK_CALLBACK);
      return response.data;
    },
  };

  // GitHub OAuth
  github = {
    login: (): string => {
      // Return GitHub OAuth URL for redirect
      return `${API_BASE_URL}${USER_SOCIAL_AUTH_ENDPOINTS.GITHUB}`;
    },
    callback: async (): Promise<ApiSuccess<SocialLoginResponseData>> => {
      const response = await this.get(USER_SOCIAL_AUTH_ENDPOINTS.GITHUB_CALLBACK);
      return response.data;
    },
  };
}

// Export singleton instances
export const userAuthApi = new UserAuthApiService();
export const userOtpApi = new UserOtpApiService();
export const userSocialAuthApi = new UserSocialAuthApiService();

// Export authAPI for saga compatibility
export const authAPI = {
  login: userAuthApi.login.bind(userAuthApi),
  register: userAuthApi.register.bind(userAuthApi),
  forgotPassword: userAuthApi.forgotPassword.bind(userAuthApi),
  logout: userAuthApi.logout.bind(userAuthApi),
  refreshToken: userAuthApi.refreshToken.bind(userAuthApi),
  getProfile: userAuthApi.getProfile.bind(userAuthApi),
  updateProfile: userAuthApi.updateProfile.bind(userAuthApi),
  changePassword: userAuthApi.changePassword.bind(userAuthApi),
  verifyEmail: userAuthApi.verifyEmail.bind(userAuthApi),
  resendVerifyEmail: userAuthApi.resendVerifyEmail.bind(userAuthApi),
  resetPassword: userAuthApi.resetPassword.bind(userAuthApi),
};

// Export default
export default userAuthApi;
