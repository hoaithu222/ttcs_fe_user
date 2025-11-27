import { IAuthState } from "./auth.types";
import { createResettableSlice } from "@/app/store/create-resettabable-slice";
import { AppReducerType, ReduxStateType } from "@/app/store/types";
import { LoginRequest } from "@/core/api/auth/type";
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
    },
    loginSuccess: (state, action) => {
      console.log("[auth.slice] loginSuccess - user payload:", action.payload);
      state.isLoadingLogin = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      console.log("[auth.slice] loginSuccess - Updated state:", {
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      });
    },
    loginFailed: (state) => {
      state.isLoadingLogin = false;
      state.isAuthenticated = false;
      state.user = null;
    },
    register: (state, _action: PayloadAction<any>) => {
      state.isLoadingRegister = true;
      state.registerStatus = ReduxStateType.LOADING;
      state.user = null;
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
} = slice.actions;

export default reducer;
