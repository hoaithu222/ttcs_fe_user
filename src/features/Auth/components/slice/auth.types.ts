import { ReduxStateType } from "@/app/store/types";
import { User } from "@/core/api/auth/type";

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
