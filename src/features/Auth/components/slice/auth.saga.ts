import { call, put, select, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { authAPI, userOtpApi } from "@/core/api/auth";
import { LoginRequest, ForgotPasswordRequest, User, ApiSuccess } from "@/core/api/auth/type";
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
  completeFirstLoginSetup,
  completeFirstLoginSetupFailed,
  completeFirstLoginSetupSuccess,
  openVerifyEmailFlow,
  submitVerifyEmailOtp,
  submitVerifyEmailOtpSuccess,
  submitVerifyEmailOtpFailed,
  resendVerifyEmailOtp,
  resendVerifyEmailOtpSuccess,
  resendVerifyEmailOtpFailed,
  submitPostLoginOtp,
  submitPostLoginOtpSuccess,
  submitPostLoginOtpFailed,
  resendPostLoginOtp,
} from "./auth.slice";
import { toastUtils } from "@/shared/utils/toast.utils";
import { resetShopState } from "@/features/Shop/slice/shop.slice";
import { resetProfileState } from "@/features/Profile/slice/profile.slice";
import { resetChatState } from "@/app/store/slices/chat/chat.slice";
import { selectUser as selectAuthUser } from "@/features/Auth/components/slice/auth.selector";

const AUTH_ERROR_CODE = {
  EMAIL_NOT_VERIFIED: -4,
} as const;

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

      // Reset chat data to avoid leaking conversations across accounts
      yield put(resetChatState());
      yield put(loginSuccess(response.data.user));
      
      // Check if user has 2FA enabled and is not first login
      if (response.data.user.twoFactorAuth && !response.data.user.isFirstLogin) {
        try {
          yield call([userOtpApi, userOtpApi.request], {
            identifier: response.data.user.email,
            channel: "email",
            purpose: "login_2fa",
          });
          toastUtils.info("Vui lòng nhập mã OTP để hoàn tất đăng nhập.");
        } catch (otpError) {
          console.error("Failed to request OTP:", otpError);
          // Continue anyway, user can manually request OTP
        }
      } else {
        toastUtils.success("Đăng nhập thành công!");
      }
    } else {
      yield put(loginFailed());
      toastUtils.error(response.message || "Đăng nhập thất bại");
    }
  } catch (error: any) {
    yield put(loginFailed());
    
    // http-client throws ErrorData with structure:
    // { code: "ERROR_-4", originalError: { response: { data: { code: -4, ... } } } }
    // Or direct axios error: { response: { data: { code: -4, ... } } }
    
    let errorCode: number | null = null;
    
    // Try to get error code from different possible locations
    if (error?.originalError?.response?.data?.code !== undefined) {
      errorCode = error.originalError.response.data.code;
    } else if (error?.response?.data?.code !== undefined) {
      errorCode = error.response.data.code;
    } else if (error?.code && typeof error.code === "string" && error.code.includes("ERROR_")) {
      // Parse from "ERROR_-4" format
      const codeStr = error.code.replace("ERROR_", "");
      errorCode = parseInt(codeStr, 10);
    }
    
    console.log("[Login Saga] Error caught:", {
      error,
      errorCode,
      originalError: error?.originalError,
      responseData: error?.response?.data,
    });
    
    if (errorCode === AUTH_ERROR_CODE.EMAIL_NOT_VERIFIED) {
      // Tự động gửi lại email OTP
      try {
        yield call(authAPI.resendVerifyEmail, { email: action.payload.email });
        toastUtils.success("Mã OTP đã được gửi lại đến email của bạn.");
      } catch (resendError) {
        console.error("Failed to resend verify email:", resendError);
        // Vẫn mở modal để user có thể tự gửi lại
        toastUtils.warning("Không thể tự động gửi email. Vui lòng thử lại trong modal.");
      }
      
      // Mở modal verify email
      yield put(
        openVerifyEmailFlow({
          email: action.payload.email,
          trigger: "login",
        })
      );
      toastUtils.info("Email chưa xác thực. Vui lòng nhập mã OTP để kích hoạt tài khoản.");
    } else {
      const errorMessage = 
        error?.originalError?.response?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Đăng nhập thất bại";
      toastUtils.error(errorMessage);
    }
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
      otpMethod: action.payload.otpMethod,
    };

    const response = yield call(authAPI.register, transformedPayload);

    if (response.success) {
      yield put(registerSuccess());
      yield put(
        openVerifyEmailFlow({
          email: action.payload.email,
          trigger: "register",
        })
      );
      toastUtils.success("Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.");
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

    // Reset feature states that should not persist between accounts
    yield put(resetShopState());
    yield put(resetProfileState());
    yield put(resetChatState());

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

    // Reset feature states that should not persist between accounts
    yield put(resetShopState());
    yield put(resetProfileState());
    yield put(resetChatState());

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

// Complete first login setup saga
function* handleCompleteFirstLoginSetup(
  action: PayloadAction<{ twoFactorAuth: boolean }>
): Generator<any, void, any> {
  try {
    const apiPayload = {
      twoFactorAuth: action.payload.twoFactorAuth,
      isFirstLogin: false,
    };
    yield call(authAPI.updateProfile, apiPayload);
    yield put(
      completeFirstLoginSetupSuccess({
        twoFactorAuth: apiPayload.twoFactorAuth,
      })
    );
    toastUtils.success("Cập nhật xác minh 2 bước thành công");
  } catch (error: any) {
    yield put(completeFirstLoginSetupFailed());
    toastUtils.error(
      error?.response?.data?.message || "Không thể cập nhật xác minh 2 bước"
    );
  }
}

function* handleVerifyEmailOtp(
  action: PayloadAction<{ token: string }>
): Generator<any, void, any> {
  try {
    const response = yield call(authAPI.verifyEmail, action.payload.token);
    if (response.success) {
      yield put(submitVerifyEmailOtpSuccess());
      toastUtils.success(response.message || "Xác minh email thành công");
    } else {
      yield put(submitVerifyEmailOtpFailed());
      // toastUtils.error(response.message || "Không thể xác minh email");
    }
  } catch (error: any) {
    yield put(submitVerifyEmailOtpFailed());
    //toastUtils.error(error?.response?.data?.message || "Không thể xác minh email");
  }
}

function* handleResendVerifyEmailOtp(
  action: PayloadAction<{ email: string }>
): Generator<any, void, any> {
  try {
    const response = yield call(authAPI.resendVerifyEmail, { email: action.payload.email });
    if (response.success) {
      yield put(resendVerifyEmailOtpSuccess());
      toastUtils.success(response.message || "Đã gửi lại OTP");
    } else {
      yield put(resendVerifyEmailOtpFailed());
      toastUtils.error(response.message || "Không thể gửi lại OTP");
    }
  } catch (error: any) {
    yield put(resendVerifyEmailOtpFailed());
    toastUtils.error(error?.response?.data?.message || "Không thể gửi lại OTP");
  }
}

// Post-login OTP verification saga
function* handlePostLoginOtp(
  action: PayloadAction<{ code: string }>
): Generator<any, void, any> {
  try {
    const fallbackUser: User | null = (yield select(selectAuthUser)) ?? null;

    let user: User | null = fallbackUser;
    try {
      const profileResponse: ApiSuccess<User> = yield call(authAPI.getProfile);
      if (profileResponse?.data) {
        user = profileResponse.data;
      }
    } catch (profileError) {
      console.warn("[handlePostLoginOtp] Failed to fetch profile, fallback to cached user", profileError);
    }

    const userEmail = user?.email;

    if (!userEmail) {
      throw new Error("Không thể lấy thông tin người dùng");
    }

    const verifyPayload: any = {
      identifier: userEmail,
      code: action.payload.code,
      purpose: "login_2fa",
    };

    const response = yield call([userOtpApi, userOtpApi.verify], verifyPayload);
    if (response.success) {
      yield put(submitPostLoginOtpSuccess());
      toastUtils.success("Xác minh OTP thành công! Đăng nhập hoàn tất.");
    } else {
      throw new Error(response.message || "Mã OTP không hợp lệ");
    }
  } catch (error: any) {
    yield put(submitPostLoginOtpFailed());
    toastUtils.error(error?.response?.data?.message || error.message || "Mã OTP không hợp lệ");
  }
}

function* handleResendPostLoginOtp(): Generator<any, void, any> {
  try {
    const fallbackUser: User | null = (yield select(selectAuthUser)) ?? null;

    let user: User | null = fallbackUser;
    try {
      const profileResponse: ApiSuccess<User> = yield call(authAPI.getProfile);
      if (profileResponse?.data) {
        user = profileResponse.data;
      }
    } catch (profileError) {
      console.warn("[handleResendPostLoginOtp] Failed to fetch profile, fallback to cached user", profileError);
    }

    const userEmail = user?.email;

    if (!userEmail) {
      throw new Error("Không thể lấy thông tin người dùng");
    }

    const response = yield call([userOtpApi, userOtpApi.request], {
      identifier: userEmail,
      channel: "email",
      purpose: "login_2fa",
    });

    if (response.success) {
      toastUtils.success("Đã gửi lại mã OTP");
    } else {
      throw new Error(response.message || "Không thể gửi lại OTP");
    }
  } catch (error: any) {
    toastUtils.error(error?.response?.data?.message || "Không thể gửi lại OTP");
  }
}

export function* authSaga() {
  yield takeLatest(loginUser.type, handleLogin);
  yield takeLatest(register.type, handleRegister);
  yield takeLatest(forgotPassword.type, handleForgotPassword);
  yield takeLatest(logoutUser.type, handleLogout);
  yield takeLatest("auth/refreshToken", handleRefreshToken);
  yield takeLatest(completeFirstLoginSetup.type, handleCompleteFirstLoginSetup);
  yield takeLatest(submitVerifyEmailOtp.type, handleVerifyEmailOtp);
  yield takeLatest(resendVerifyEmailOtp.type, handleResendVerifyEmailOtp);
  yield takeLatest(submitPostLoginOtp.type, handlePostLoginOtp);
  yield takeLatest(resendPostLoginOtp.type, handleResendPostLoginOtp);
}
