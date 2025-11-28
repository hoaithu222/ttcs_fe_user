import { ReduxStateType } from "@/app/store/types";
import { User } from "@/core/api/auth/type";

export enum ILoginStep{
  INIT = "INIT",
  NO_VERIFY_EMAIL = "NO_VERIFY_EMAIL",
  VERIFY_EMAIL = "VERIFY_EMAIL",
  // trường hợp xác minh 2fa 
  VERIFY_2FA = "VERIFY_2FA",
}

export enum stepRegister{
  INIT = "INIT",
  VERIFY_EMAIL = "VERIFY_EMAIL",
}

// Lưu thông tin otp của user
export interface IUserOtp{
  otpType: "email" | "smart";
  otp: string;
  otpExpiresAt: Date;
  otpSmart: string;
}

export interface IFirstLoginFlowState {
  show2FAReminder: boolean; // Modal khuyên bật 2FA
  showMethodSelector: boolean;
  showOtpModal: boolean;
  selectedMethod: "email" | "smart";
  submitting: boolean;
  enableTwoFactor: boolean;
}

export interface IVerifyEmailFlowState {
  open: boolean;
  email?: string;
  submitting: boolean;
  resending: boolean;
  verified: boolean;
  lastTrigger?: "register" | "login";
}

export interface IAuthState {
  // Authentication status
  isAuthenticated: boolean;
  user: User | null;

  // UI state
  isLogin: boolean;
  isRegister: boolean;

  // Loading states
  isLoadingLogin: boolean;
  isLoadingRegister: boolean;
  isLoadingForgotPassword: boolean;

  // Register state
  registerStatus: ReduxStateType;
  registerStep: stepRegister;

  // Login state
  loginStatus: ReduxStateType;
  loginStep: ILoginStep;
  userOtp: IUserOtp;
  firstLoginFlow: IFirstLoginFlowState;
  verifyEmailFlow: IVerifyEmailFlowState;

  // Forgot password state
  forgotPassword: {
    forgotPasswordStatus: ReduxStateType;
    stepForgotPassword: "email" | "otp" | "resetPassword";
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  };

  // Logout state
  logout: {
    logoutStatus: ReduxStateType;
  };
}
