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
import { toastUtils } from "@/shared/utils/toast.utils";

// Login saga
function* handleLogin(action: PayloadAction<LoginRequest>): Generator<any, void, any> {
  try {
    const response: any = yield call(authAPI.login, action.payload);

    if (response.success) {
      // Lưu tokens vào localStorage
      tokenUtils.setTokens(response.data.user.accessToken, response.data.user.refreshToken);

      yield put(loginSuccess(response.data.user));

      // Show success toast
      toastUtils.success(response.message || "Đăng nhập thành công!");
    } else {
      yield put(loginFailed());
    }
  } catch (error) {
    console.error("Login error:", error);
    yield put(loginFailed());
  }
}

// Register saga
function* handleRegister(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const response: any = yield call(authAPI.register, action.payload);

    if (response.success) {
      yield put(registerSuccess());

      // Show success toast
      toastUtils.success(
        response.message || "Đăng ký thành công! Vui lòng kiểm tra email để xác thực."
      );
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

      // Show success toast
      toastUtils.success(response.message || "Email đặt lại mật khẩu đã được gửi!");
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
    const response: any = yield call(authAPI.logout);

    // Xóa tokens khỏi localStorage
    tokenUtils.clearTokens();

    yield put(logoutSuccess());

    // Show success toast
    toastUtils.success(response?.message || "Đăng xuất thành công!");
  } catch (error) {
    console.error("Logout error:", error);
    // Vẫn logout ngay cả khi API call thất bại
    tokenUtils.clearTokens();
    yield put(logoutSuccess());

    // Show success toast even on error
    toastUtils.success("Đăng xuất thành công!");
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
