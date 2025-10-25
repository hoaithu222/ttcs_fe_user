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
      state.isLoadingLogin = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    loginFailed: (state) => {
      state.isLoadingLogin = false;
      state.isAuthenticated = false;
      state.user = null;
    },
    register: (state, _action: PayloadAction<any>) => {
      state.isLoadingRegister = true;
      state.user = null;
    },
    registerSuccess: (state) => {
      state.isLoadingRegister = false;
    },
    registerFailed: (state) => {
      state.isLoadingRegister = false;
    },
    forgotPassword: (state, _action: PayloadAction<string>) => {
      state.isLoadingForgotPassword = true;
    },
    forgotPasswordSuccess: (state) => {
      state.isLoadingForgotPassword = false;
    },
    forgotPasswordFailed: (state) => {
      state.isLoadingForgotPassword = false;
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
  forgotPassword,
  forgotPasswordSuccess,
  forgotPasswordFailed,
  logoutUser,
  logoutSuccess,
  logoutFailed,
  refreshTokenSuccess,
  refreshTokenFailed,
} = slice.actions;

export default reducer;
