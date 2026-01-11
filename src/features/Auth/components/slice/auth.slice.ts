import { IAuthState, ILoginStep, stepRegister } from "./auth.types";
import { createResettableSlice } from "@/app/store/create-resettabable-slice";
import { AppReducerType, ReduxStateType } from "@/app/store/types";
import { LoginRequest } from "@/core/api/auth/type";
import type { User } from "@/core/api/auth/type";
import { PayloadAction } from "@reduxjs/toolkit";



const initialState: IAuthState = {
  isAuthenticated: false,
  user: null,
  isLogin: true,
  isRegister: false,
  isLoadingLogin: false,
  isLoadingRegister: false,
  isLoadingForgotPassword: false,
  registerStatus: ReduxStateType.INIT,
  registerStep: stepRegister.INIT,
  loginStatus: ReduxStateType.INIT,
  loginStep: ILoginStep.INIT,
  userOtp: {
    otpType: "email",
    otp: "",
    otpExpiresAt: new Date(),
    otpSmart: "",
  },
  firstLoginFlow: {
    show2FAReminder: false,
    showMethodSelector: false,
    showOtpModal: false,
    selectedMethod: "email",
    submitting: false,
    enableTwoFactor: false,
  },
  forgotPassword: {
    forgotPasswordStatus: ReduxStateType.INIT,
    stepForgotPassword: "email",
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  },
  logout: {
    logoutStatus: ReduxStateType.INIT,
  },
  verifyEmailFlow: {
    open: false,
    email: undefined,
    submitting: false,
    resending: false,
    verified: false,
    lastTrigger: undefined,
  },
};

export const { slice, reducer } = createResettableSlice({
  name: AppReducerType.AUTH,
  initialState,
  reducers: {
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setIsLogin: (state, action) => {
      state.isLogin = action.payload;
    },
    setIsRegister: (state, action) => {
      state.isRegister = action.payload;
    },
    setIsLoadingLogin: (state, action) => {
      state.isLoadingLogin = action.payload;
    },
    setIsLoadingForgotPassword: (state, action) => {
      state.isLoadingForgotPassword = action.payload;
    },
    loginUser: (state, _action: PayloadAction<LoginRequest>) => {
      state.isLoadingLogin = true;
      state.isAuthenticated = false;
      state.user = null;
      state.loginStatus = ReduxStateType.LOADING;
      state.loginStep = ILoginStep.INIT;
      state.userOtp = {
        otpType: "email",
        otp: "",
        otpExpiresAt: new Date(),
        otpSmart: "",
      };
    },
    loginSuccess: (state, action) => {
      state.isLoadingLogin = false;
      state.user = action.payload;
      if (action.payload?.isFirstLogin) {
        // First login flow: Show 2FA reminder modal first
        state.isAuthenticated = true;
        state.firstLoginFlow.show2FAReminder = true;
        state.firstLoginFlow.selectedMethod =
          action.payload.otpMethod === "smart_otp" ? "smart" : "email";
        state.firstLoginFlow.enableTwoFactor = Boolean(action.payload.twoFactorAuth);
        state.loginStep = ILoginStep.INIT;
      } else if (action.payload?.twoFactorAuth) {
        // User has 2FA enabled, require OTP verification
        state.isAuthenticated = false; // Don't set authenticated until OTP is verified
        state.loginStep = ILoginStep.VERIFY_2FA;
        state.userOtp.otpType = action.payload.otpMethod === "smart_otp" ? "smart" : "email";
        state.firstLoginFlow = { ...initialState.firstLoginFlow };
      } else {
        // Normal login, no 2FA
        state.isAuthenticated = true;
        state.loginStep = ILoginStep.INIT;
        state.firstLoginFlow = { ...initialState.firstLoginFlow };
      }
    },
    loginFailed: (state) => {
      state.isLoadingLogin = false;
      state.isAuthenticated = false;
      state.user = null;
    },
    register: (state, _action: PayloadAction<any>) => {
      state.isLoadingRegister = true;
      state.registerStep = stepRegister.INIT;
      state.registerStatus = ReduxStateType.LOADING;
      state.user = null;
    },
    verifyEmail: (state) => {
      state.registerStep = stepRegister.VERIFY_EMAIL;
    },
    registerSuccess: (state) => {
      state.isLoadingRegister = false;
      state.registerStatus = ReduxStateType.SUCCESS;
    },
    registerFailed: (state) => {
      state.isLoadingRegister = false;
      state.registerStatus = ReduxStateType.ERROR;
    },
    resetRegisterStatus: (state) => {
      state.registerStatus = ReduxStateType.INIT;
    },
    forgotPassword: (state, action: PayloadAction<string>) => {
      state.isLoadingForgotPassword = true;
      state.forgotPassword.forgotPasswordStatus = ReduxStateType.LOADING;
      state.forgotPassword.email = action.payload;
      state.forgotPassword.stepForgotPassword = "email";
    },
    forgotPasswordSuccess: (state) => {
      state.isLoadingForgotPassword = false;
      state.forgotPassword.forgotPasswordStatus = ReduxStateType.SUCCESS;
      state.forgotPassword.stepForgotPassword = "otp";
    },
    forgotPasswordFailed: (state) => {
      state.isLoadingForgotPassword = false;
      state.forgotPassword.forgotPasswordStatus = ReduxStateType.ERROR;
    },
    setForgotPasswordStep: (state, action: PayloadAction<"email" | "otp" | "resetPassword">) => {
      state.forgotPassword.stepForgotPassword = action.payload;
    },
    setForgotPasswordOtp: (state, action: PayloadAction<string>) => {
      state.forgotPassword.otp = action.payload;
    },
    setForgotPasswordNewPassword: (state, action: PayloadAction<string>) => {
      state.forgotPassword.newPassword = action.payload;
    },
    setForgotPasswordConfirmPassword: (state, action: PayloadAction<string>) => {
      state.forgotPassword.confirmPassword = action.payload;
    },
    resetForgotPassword: (state) => {
      state.forgotPassword = {
        forgotPasswordStatus: ReduxStateType.INIT,
        stepForgotPassword: "email",
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      };
    },
    logoutUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.logout.logoutStatus = ReduxStateType.LOADING;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.logout.logoutStatus = ReduxStateType.SUCCESS;
      state.firstLoginFlow = { ...initialState.firstLoginFlow };
    },
    logoutFailed: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.logout.logoutStatus = ReduxStateType.ERROR;
    },
    resetLogoutStatus: (state) => {
      state.logout.logoutStatus = ReduxStateType.INIT;
    },
    refreshTokenSuccess: (state, action) => {
      // Cập nhật token mới trong user state nếu cần
      if (state.user && action.payload) {
        state.user.accessToken = action.payload.accessToken;
        state.user.refreshToken = action.payload.refreshToken;
      }
    },
    refreshTokenFailed: (state) => {
      // Refresh token thất bại, logout user
      state.isAuthenticated = false;
      state.user = null;
      state.logout.logoutStatus = ReduxStateType.ERROR;
    },
    // Update current user fields (e.g., after profile update)
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload } as any;
      } else {
        // If user not set yet, initialize with payload
        state.user = action.payload as any;
      }
    },
    // First login flow: 2FA reminder
    acknowledgeTwoFactorReminder: (state) => {
      state.firstLoginFlow.show2FAReminder = false;
    },
    skipTwoFactorReminder: (state) => {
      // Skip 2FA reminder, simply mark as complete
      state.firstLoginFlow.show2FAReminder = false;
    },
    backToTwoFactorReminder: (state) => {
      state.firstLoginFlow.show2FAReminder = true;
      state.firstLoginFlow.showMethodSelector = false;
      state.firstLoginFlow.showOtpModal = false;
    },
    setFirstLoginSelectedMethod: (
      state,
      action: PayloadAction<"email" | "smart">
    ) => {
      state.firstLoginFlow.selectedMethod = action.payload;
    },
    setTwoFactorOptIn: (state, action: PayloadAction<boolean>) => {
      state.firstLoginFlow.enableTwoFactor = action.payload;
    },
    openFirstLoginOtpModal: (state) => {
      state.firstLoginFlow.showOtpModal = true;
      state.firstLoginFlow.showMethodSelector = false;
    },
    closeFirstLoginOtpModal: (state) => {
      state.firstLoginFlow = { ...initialState.firstLoginFlow };
    },
    completeFirstLoginSetup: (
      state,
      _action: PayloadAction<{ twoFactorAuth: boolean }>
    ) => {
      state.firstLoginFlow.submitting = true;
    },
    completeFirstLoginSetupSuccess: (
      state,
      action: PayloadAction<{ twoFactorAuth: boolean }>
    ) => {
      state.firstLoginFlow.submitting = false;
      if (state.user) {
        state.user.isFirstLogin = false; // Mark first login as complete
        state.user.twoFactorAuth = action.payload.twoFactorAuth;
      }
      // Reset first login flow
      state.firstLoginFlow = { ...initialState.firstLoginFlow };
    },
    // Mark first login as complete (after showing modals)
    markFirstLoginComplete: (state) => {
      if (state.user) {
        state.user.isFirstLogin = false;
      }
      state.firstLoginFlow = { ...initialState.firstLoginFlow };
    },
    completeFirstLoginSetupFailed: (state) => {
      state.firstLoginFlow.submitting = false;
    },
    openVerifyEmailFlow: (state, action: PayloadAction<{ email: string; trigger?: "register" | "login" }>) => {
      state.verifyEmailFlow.open = true;
      state.verifyEmailFlow.email = action.payload.email;
      state.verifyEmailFlow.verified = false;
      state.verifyEmailFlow.submitting = false;
      state.verifyEmailFlow.resending = false;
      state.verifyEmailFlow.lastTrigger = action.payload.trigger;
    },
    closeVerifyEmailFlow: (state) => {
      state.verifyEmailFlow.open = false;
    },
    submitVerifyEmailOtp: (state, _action: PayloadAction<{ token: string }>) => {
      state.verifyEmailFlow.submitting = true;
    },
    submitVerifyEmailOtpSuccess: (state) => {
      state.verifyEmailFlow.submitting = false;
      state.verifyEmailFlow.verified = true;
      state.verifyEmailFlow.open = false;
    },
    submitVerifyEmailOtpFailed: (state) => {
      state.verifyEmailFlow.submitting = false;
    },
    resendVerifyEmailOtp: (state, _action: PayloadAction<{ email: string }>) => {
      state.verifyEmailFlow.resending = true;
    },
    resendVerifyEmailOtpSuccess: (state) => {
      state.verifyEmailFlow.resending = false;
    },
    resendVerifyEmailOtpFailed: (state) => {
      state.verifyEmailFlow.resending = false;
    },
    resetVerifyEmailFlow: (state) => {
      state.verifyEmailFlow = { ...initialState.verifyEmailFlow };
    },
    // Post-login OTP verification (for 2FA)
    submitPostLoginOtp: (state, _action: PayloadAction<{ code: string }>) => {
      state.loginStatus = ReduxStateType.LOADING;
    },
    submitPostLoginOtpSuccess: (state) => {
      state.loginStatus = ReduxStateType.SUCCESS;
      state.isAuthenticated = true;
      state.loginStep = ILoginStep.INIT;
      state.userOtp.otp = "";
      state.userOtp.otpSmart = "";
    },
    submitPostLoginOtpFailed: (state) => {
      state.loginStatus = ReduxStateType.ERROR;
      state.userOtp.otp = "";
      state.userOtp.otpSmart = "";
    },
    resendPostLoginOtp: (state) => {
      // Trigger OTP resend
    },
  },
  persist: {
    whitelist: ["user", "isAuthenticated"],
  },
});

export const {
  setIsAuthenticated,
  setIsLogin,
  setIsRegister,
  setIsLoadingLogin,
  setIsLoadingForgotPassword,
  loginUser,
  loginSuccess,
  loginFailed,
  register,
  registerSuccess,
  registerFailed,
  resetRegisterStatus,
  forgotPassword,
  forgotPasswordSuccess,
  forgotPasswordFailed,
  setForgotPasswordStep,
  setForgotPasswordOtp,
  setForgotPasswordNewPassword,
  setForgotPasswordConfirmPassword,
  resetForgotPassword,
  logoutUser,
  logoutSuccess,
  logoutFailed,
  resetLogoutStatus,
  refreshTokenSuccess,
  refreshTokenFailed,
  acknowledgeTwoFactorReminder,
  skipTwoFactorReminder,
  markFirstLoginComplete,
  setFirstLoginSelectedMethod,
  setTwoFactorOptIn,
  openFirstLoginOtpModal,
  closeFirstLoginOtpModal,
  completeFirstLoginSetup,
  completeFirstLoginSetupSuccess,
  completeFirstLoginSetupFailed,
  backToTwoFactorReminder,
  openVerifyEmailFlow,
  closeVerifyEmailFlow,
  submitVerifyEmailOtp,
  submitVerifyEmailOtpSuccess,
  submitVerifyEmailOtpFailed,
  resendVerifyEmailOtp,
  resendVerifyEmailOtpSuccess,
  resendVerifyEmailOtpFailed,
  resetVerifyEmailFlow,
  submitPostLoginOtp,
  submitPostLoginOtpSuccess,
  submitPostLoginOtpFailed,
  resendPostLoginOtp,
  updateUserProfile,
} = slice.actions;

export default reducer;
