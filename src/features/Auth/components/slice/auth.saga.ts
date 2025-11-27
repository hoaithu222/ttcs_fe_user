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
import { toastUtils } from "@/shared/utils/toast.utils";
import { resetShopState } from "@/features/Shop/slice/shop.slice";
import { resetProfileState } from "@/features/Profile/slice/profile.slice";

// Login saga
function* handleLogin(action: PayloadAction<LoginRequest>): Generator<any, void, any> {
  try {
    const response = yield call(authAPI.login, action.payload);

    if (response.success && response.data) {
      // Lưu token vào localStorage
      if (response.data.user.accessToken) {
        localStorage.setItem("accessToken", response.data.user.accessToken);
      }
      if (response.data.user.refreshToken) {
        localStorage.setItem("refreshToken", response.data.user.refreshToken);
      }

      yield put(loginSuccess(response.data.user));
      toastUtils.success("Đăng nhập thành công!");
    } else {
      yield put(loginFailed());
      toastUtils.error(response.message || "Đăng nhập thất bại");
    }
  } catch (error: any) {
    yield put(loginFailed());
    toastUtils.error(error.response?.data?.message || "Đăng nhập thất bại");
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

    const response = yield call(authAPI.register, transformedPayload);

    if (response.success) {
      yield put(registerSuccess());
      toastUtils.success("Đăng ký thành công");
    } else {
      yield put(registerFailed());
      // Luôn hiển thị toast lỗi khi đăng ký thất bại, bất kể skipToast flag
      toastUtils.error(response.message || "Đăng ký thất bại");
    }
  } catch (error: any) {
    yield put(registerFailed());
    // Luôn hiển thị toast lỗi khi đăng ký thất bại
    // Lấy message từ error object (ErrorData có message property)
    // Hoặc từ response.data nếu error là AxiosError
    const errorMessage =
      error?.message ||
      error?.response?.data?.message ||
      (error?.originalError?.data &&
      typeof error.originalError.data === "object" &&
      !Array.isArray(error.originalError.data)
        ? error.originalError.data.message
        : null) ||
      "Đăng ký thất bại";
    toastUtils.error(errorMessage);
  }
}

// Forgot password saga
function* handleForgotPassword(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const forgotPasswordData: ForgotPasswordRequest = { email: action.payload };
    const response = yield call(authAPI.forgotPassword, forgotPasswordData);

    if (response.success) {
      yield put(forgotPasswordSuccess());
      toastUtils.success(response.message || "Email đã được gửi thành công");
    } else {
      yield put(forgotPasswordFailed());
      toastUtils.error(response.message || "Gửi email thất bại");
    }
  } catch (error: any) {
    yield put(forgotPasswordFailed());
    toastUtils.error(error.response?.data?.message || "Gửi email thất bại");
  }
}

// Logout saga
function* handleLogout(): Generator<any, void, any> {
  try {
    console.log("Logout saga started");

    // Gọi API logout (nếu có)
    try {
      yield call(authAPI.logout);
      console.log("Logout API call successful");
    } catch (apiError) {
      console.warn("Logout API call failed:", apiError);
      // Tiếp tục logout ngay cả khi API call thất bại
    }

    // Xóa token khỏi localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    console.log("Tokens removed from localStorage");

    // Xóa Redux persist data
    localStorage.removeItem("persist:root");
    localStorage.removeItem("persist:auth");
    console.log("Redux persist data removed");

    // Reset shop state và profile state khi logout
    yield put(resetShopState());
    yield put(resetProfileState());

    yield put(logoutSuccess());
    toastUtils.success("Đăng xuất thành công");
    console.log("Logout saga completed successfully - logoutStatus set to SUCCESS");
  } catch (error: any) {
    console.error("Logout saga error:", error);

    // Ngay cả khi có lỗi, vẫn xóa tokens và logout
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("persist:root");
    localStorage.removeItem("persist:auth");

    // Reset shop state và profile state khi logout
    yield put(resetShopState());
    yield put(resetProfileState());

    yield put(logoutSuccess());
    toastUtils.success("Đăng xuất thành công");
    console.log("Logout saga completed with error handling - logoutStatus set to SUCCESS");
  }
}

// Refresh token saga
function* handleRefreshToken(): Generator<any, void, any> {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      yield put(refreshTokenFailed());
      yield put(logoutUser());
      return;
    }

    const response = yield call(authAPI.refreshToken, refreshToken);

    if (response.success && response.data) {
      // Cập nhật token mới
      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }

      yield put(refreshTokenSuccess(response.data));
    } else {
      yield put(refreshTokenFailed());
      yield put(logoutUser());
    }
  } catch (error: any) {
    yield put(refreshTokenFailed());
    yield put(logoutUser());
    toastUtils.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
  }
}

export function* authSaga() {
  yield takeLatest(loginUser.type, handleLogin);
  yield takeLatest(register.type, handleRegister);
  yield takeLatest(forgotPassword.type, handleForgotPassword);
  yield takeLatest(logoutUser.type, handleLogout);
  yield takeLatest("auth/refreshToken", handleRefreshToken);
}
