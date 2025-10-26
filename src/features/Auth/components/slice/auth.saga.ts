import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { authAPI } from "@/core/api/auth";
import { LoginRequest, ForgotPasswordRequest } from "@/core/api/auth/type";
import {
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
  refreshTokenSuccess,
  refreshTokenFailed,
} from "./auth.slice";
import { tokenUtils } from "@/shared/utils/token.utils";

// Login saga
function* handleLogin(action: PayloadAction<LoginRequest>): Generator<any, void, any> {
  try {
    console.log("[Login Saga] Starting login with credentials:", action.payload);

    const response: any = yield call(authAPI.login, action.payload);

    console.log("[Login Saga] Full response:", JSON.stringify(response, null, 2));
    console.log("[Login Saga] Response.success:", response.success);
    console.log("[Login Saga] Response.data:", response.data);

    if (response.success) {
      // Backend trả về: response.data.user (user object nằm trong data.user)
      const userData = response.data.user;

      console.log("[Login Saga] User data from response:", userData);

      // Lưu tokens vào localStorage
      tokenUtils.setTokens(userData.accessToken, userData.refreshToken);
      console.log("[Login Saga] Tokens saved to localStorage");

      // Loại bỏ password và các field không cần thiết khỏi user object
      const { password, __v, ...cleanUser } = userData;

      console.log("[Login Saga] Clean user:", cleanUser);

      yield put(loginSuccess(cleanUser));
      console.log("[Login Saga] loginSuccess action dispatched");
      // Toast sẽ được hiện tự động từ interceptor khi response.success = true
    } else {
      console.log("[Login Saga] Login failed - success is not true");
      yield put(loginFailed());
    }
  } catch (error) {
    console.error("[Login Saga] Login error:", error);
    yield put(loginFailed());
  }
}

// Register saga
function* handleRegister(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    // Transform payload from frontend format to backend format
    // Frontend: { fullName, email, password, confirmPassword }
    // Backend: { name, email, password }
    const transformedPayload = {
      name: action.payload.fullName || action.payload.name,
      email: action.payload.email,
      password: action.payload.password,
    };

    console.log("[Register Saga] Original payload:", action.payload);
    console.log("[Register Saga] Transformed payload:", transformedPayload);

    const response: any = yield call(authAPI.register, transformedPayload);

    if (response.success) {
      yield put(registerSuccess());
      // Toast sẽ được hiện tự động từ interceptor khi response.success = true
    } else {
      yield put(registerFailed());
    }
  } catch (error) {
    console.error("Register error:", error);
    yield put(registerFailed());
  }
}

// Forgot password saga
function* handleForgotPassword(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const forgotPasswordData: ForgotPasswordRequest = { email: action.payload };
    const response: any = yield call(authAPI.forgotPassword, forgotPasswordData);

    if (response.success) {
      yield put(forgotPasswordSuccess());
      // Toast sẽ được hiện tự động từ interceptor khi response.success = true
    } else {
      yield put(forgotPasswordFailed());
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    yield put(forgotPasswordFailed());
  }
}

// Logout saga
function* handleLogout(): Generator<any, void, any> {
  try {
    yield call(authAPI.logout);

    // Xóa tokens khỏi localStorage
    tokenUtils.clearTokens();

    yield put(logoutSuccess());
    // Toast sẽ được hiện tự động từ interceptor khi response.success = true
  } catch (error) {
    console.error("Logout error:", error);
    // Vẫn logout ngay cả khi API call thất bại
    tokenUtils.clearTokens();
    yield put(logoutSuccess());
  }
}

// Refresh token saga
function* handleRefreshToken(): Generator<any, void, any> {
  try {
    const refreshToken = tokenUtils.getRefreshToken();

    if (!refreshToken) {
      yield put(refreshTokenFailed());
      return;
    }

    const response: any = yield call(authAPI.refreshToken, refreshToken);

    if (response.success) {
      // Cập nhật tokens mới
      tokenUtils.setTokens(response.data.accessToken, response.data.refreshToken);
      yield put(refreshTokenSuccess(response.data));
    } else {
      yield put(refreshTokenFailed());
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    yield put(refreshTokenFailed());
  }
}

export function* authSaga() {
  yield takeLatest(loginUser.type, handleLogin);
  yield takeLatest(register.type, handleRegister);
  yield takeLatest(forgotPassword.type, handleForgotPassword);
  yield takeLatest(logoutUser.type, handleLogout);
  yield takeLatest("auth/refreshToken", handleRefreshToken);
}
