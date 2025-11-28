// Authentication request types for users
export enum OtpChannel {
  EMAIL = "email",
  PHONE = "phone",
}

export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  otpMethod?: OtpChannel | "smart_otp";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResendVerifyEmailRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  identifier: string;
  otp: string;
  password: string;
  confirmPassword: string;
}

// OTP request types
export interface OtpRequest {
  identifier: string;
  channel: "email" | "phone";
  purpose: string;
  smartOtpPassword?: string;
}

export interface OtpVerifyRequest {
  identifier: string;
  code: string;
  purpose: string;
  smartOtpPassword?: string;
}

// Authentication response types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: "active" | "inactive";
  role: "user" | "shop_owner" | "admin";
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  accessToken?: string;
  refreshToken?: string;
  twoFactorAuth?: boolean;
  twoFactorAuthSecret?: string;
  smartOtpSecret?: string;
  otpMethod?: OtpChannel | "smart_otp";
  isFirstLogin?: boolean;
  createdAt: string;
  updatedAt: string;
  // Shop status (added when fetching profile)
  shopStatus?: "not_registered" |  "pending_review" | "approved" | "rejected" | "active" | "blocked" | "suspended";
  shop?: {
    id: string;
    name: string;
    slug?: string;
    status: string;
  } | null;
}

export interface LoginResponseData {
  message: string;
  user: User;
}

export interface RegisterResponseData {
  message: string;
  user: User;
}

export interface SimpleMessageData {
  message: string;
}

export interface SocialLoginResponseData {
  token: string;
  user: User;
}

// API response wrapper
export interface ApiSuccess<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  timestamp: string;
  code: number;
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp: string;
  path: string;
  method: string;
  code: number;
}

// Legacy types for backward compatibility
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export enum UserRole {
  USER = "user",
  SHOP_OWNER = "shop_owner",
  ADMIN = "admin",
}

// Token payload (for JWT decoding if needed)
export interface TokenPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  iat: number; // issued at
  exp: number; // expires at
}
