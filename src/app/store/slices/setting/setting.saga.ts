import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { authAPI } from "@/core/api/auth";
import { loginSuccess } from "@/features/Auth/components/slice/auth.slice";
import {
  toggle2FAStart,
  toggle2FASuccess,
  toggle2FAFailed,
  changeOtpMethodStart,
  changeOtpMethodSuccess,
  changeOtpMethodFailed,
  changeSmartOtpPasswordStart,
  changeSmartOtpPasswordSuccess,
  changeSmartOtpPasswordFailed,
  setupSmartOtpStart,
  setupSmartOtpSuccess,
  setupSmartOtpFailed,
} from "./setting.slice";
import { toastUtils } from "@/shared/utils/toast.utils";

// Toggle 2FA
function* handleToggle2FA(action: PayloadAction<{ otp: string; smartOtpPassword?: string }>): Generator<any, void, any> {
  try {
    console.log("[Toggle 2FA] Starting with OTP:", action.payload.otp);
    // Verify OTP first
    const user: any = yield call(authAPI.getProfile);
    console.log("[Toggle 2FA] User profile response:", user);
    
    if (!user || !user.success || !user.data) {
      console.error("[Toggle 2FA] Failed to get user profile:", user);
      throw new Error("Không thể lấy thông tin người dùng");
    }

    // Handle Mongoose document - convert to plain object if needed
    let userData = user.data;
    if (userData && userData._doc) {
      // Mongoose document - extract from _doc
      userData = { ...userData._doc, ...userData };
      // Remove Mongoose internal properties
      delete userData.$__;
      delete userData.$isNew;
      delete userData._doc;
    }

    // Try to get email from various possible locations
    const userEmail = userData.email || userData._doc?.email || user.data.email;
    if (!userEmail) {
      console.error("[Toggle 2FA] User email is missing. User data:", userData);
      throw new Error("Email người dùng không tồn tại");
    }

    const userOtpMethod = userData.otpMethod || user.data.otpMethod;
    const userTwoFactorAuth = userData.twoFactorAuth !== undefined ? userData.twoFactorAuth : user.data.twoFactorAuth;

    // Nếu user đang dùng Smart OTP, cần smartOtpPassword
    const verifyPayload: any = {
      identifier: userEmail,
      code: action.payload.otp,
      purpose: "verify_setting_change",
    };
    
    if (userOtpMethod === "smart_otp" && action.payload.smartOtpPassword) {
      verifyPayload.smartOtpPassword = action.payload.smartOtpPassword;
    }

    // Không verify OTP ở đây - để backend verify trong updateProfile
    // Backend sẽ verify OTP trước khi update để đảm bảo security
    const current2FA = userTwoFactorAuth || false;
    const updatePayload: any = {
      twoFactorAuth: !current2FA,
      otp: action.payload.otp,
      otpPurpose: "verify_setting_change",
    };
    
    // Nếu user đang dùng Smart OTP, cần gửi smartOtpPassword
    if (userOtpMethod === "smart_otp" && action.payload.smartOtpPassword) {
      updatePayload.smartOtpPassword = action.payload.smartOtpPassword;
    }
    
    console.log("[Toggle 2FA] Update payload:", updatePayload);
    const response: any = yield call(authAPI.updateProfile as any, updatePayload);
    console.log("[Toggle 2FA] Update response:", response);

    if (response && response.success) {
      yield put(toggle2FASuccess({ enabled: !current2FA }));
      toastUtils.success(
        !current2FA ? "Đã bật xác minh 2 bước" : "Đã tắt xác minh 2 bước"
      );
      // Refresh user profile để cập nhật state
      try {
        const updatedUser: any = yield call(authAPI.getProfile);
        console.log("[Toggle 2FA] Refreshed user:", updatedUser);
        if (updatedUser && updatedUser.success && updatedUser.data) {
          yield put(loginSuccess(updatedUser.data));
        }
      } catch (e) {
        console.error("Failed to refresh user profile:", e);
      }
    } else {
      const errorMessage = response?.message || "Không thể cập nhật xác minh 2 bước";
      console.error("[Toggle 2FA] Update failed:", errorMessage, response);
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    yield put(toggle2FAFailed({ error: error?.response?.data?.message || error.message || "Có lỗi xảy ra" }));
    toastUtils.error(error?.response?.data?.message || "Không thể cập nhật xác minh 2 bước");
  }
}

// Change OTP method
function* handleChangeOtpMethod(
  action: PayloadAction<{ method: "email" | "smart"; otp: string }>
): Generator<any, void, any> {
  try {
    console.log("[Change OTP Method] Starting with method:", action.payload.method);
    // Verify OTP first
    const user: any = yield call(authAPI.getProfile);
    if (!user.success || !user.data) {
      throw new Error("Không thể lấy thông tin người dùng");
    }

    // Handle Mongoose document - convert to plain object if needed
    let userData = user.data;
    if (userData && userData._doc) {
      userData = { ...userData._doc, ...userData };
      delete userData.$__;
      delete userData.$isNew;
      delete userData._doc;
    }

    const userEmail = userData.email || user.data.email;
    if (!userEmail) {
      throw new Error("Email người dùng không tồn tại");
    }

    console.log("[Change OTP Method] Current user OTP method:", userData.otpMethod);
    // Không verify OTP ở đây - để backend verify trong updateProfile
    // Backend sẽ verify OTP trước khi update để đảm bảo security
    
    const otpMethodBackend = action.payload.method === "smart" ? "smart_otp" : "email";
    const updatePayload: any = {
      otpMethod: otpMethodBackend,
      otp: action.payload.otp,
      otpPurpose: "verify_setting_change",
    };
    
    console.log("[Change OTP Method] Update payload:", updatePayload);
    const response: any = yield call(authAPI.updateProfile as any, updatePayload);
    console.log("[Change OTP Method] Update response:", response);

    if (response && response.success) {
      yield put(changeOtpMethodSuccess({ method: action.payload.method }));
      toastUtils.success("Đã thay đổi phương thức OTP");
      // Refresh user profile để cập nhật state
      try {
        const updatedUser: any = yield call(authAPI.getProfile);
        console.log("[Change OTP Method] Refreshed user:", updatedUser);
        if (updatedUser && updatedUser.success && updatedUser.data) {
          yield put(loginSuccess(updatedUser.data));
        }
      } catch (e) {
        console.error("[Change OTP Method] Failed to refresh user profile:", e);
      }
    } else {
      const errorMessage = response?.message || response?.data?.message || "Không thể thay đổi phương thức OTP";
      console.error("[Change OTP Method] Update failed:", errorMessage, response);
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error("[Change OTP Method] Error:", error);
    yield put(changeOtpMethodFailed({ error: error?.response?.data?.message || error.message || "Có lỗi xảy ra" }));
    toastUtils.error(error?.response?.data?.message || "Không thể thay đổi phương thức OTP");
  }
}

// Change SmartOTP password
function* handleChangeSmartOtpPassword(
  action: PayloadAction<{ newPassword: string; otp: string }>
): Generator<any, void, any> {
  try {
    // Verify OTP first
    const user: any = yield call(authAPI.getProfile);
    if (!user.success || !user.data) {
      throw new Error("Không thể lấy thông tin người dùng");
    }

    // Không verify OTP ở đây - để backend verify trong updateProfile
    // Backend sẽ verify OTP trước khi update để đảm bảo security

    // Backend sẽ hash password này
    const response: any = yield call(authAPI.updateProfile as any, {
      smartOtpSecret: action.payload.newPassword,
      otp: action.payload.otp,
      otpPurpose: "change_smart_otp_password",
    });

    if (response.success) {
      yield put(changeSmartOtpPasswordSuccess());
      toastUtils.success("Đã thay đổi mật khẩu SmartOTP");
    } else {
      throw new Error(response.message || "Không thể thay đổi mật khẩu SmartOTP");
    }
  } catch (error: any) {
    yield put(changeSmartOtpPasswordFailed({ error: error?.response?.data?.message || error.message || "Có lỗi xảy ra" }));
    toastUtils.error(error?.response?.data?.message || "Không thể thay đổi mật khẩu SmartOTP");
  }
}

// Setup SmartOTP (first time)
function* handleSetupSmartOtp(
  action: PayloadAction<{ password: string; otp: string }>
): Generator<any, void, any> {
  try {
    // Verify OTP first
    const user: any = yield call(authAPI.getProfile);
    if (!user.success || !user.data) {
      throw new Error("Không thể lấy thông tin người dùng");
    }

    // Không verify OTP ở đây - để backend verify trong updateProfile
    // Backend sẽ verify OTP trước khi update để đảm bảo security
    
    // Backend sẽ hash password này
    const response: any = yield call(authAPI.updateProfile as any, {
      otpMethod: "smart_otp",
      smartOtpSecret: action.payload.password,
      otp: action.payload.otp,
      otpPurpose: "setup_smart_otp",
    });

    if (response.success) {
      yield put(setupSmartOtpSuccess());
      toastUtils.success("Đã thiết lập SmartOTP thành công");
      // Refresh user profile để cập nhật state
      try {
        const updatedUser: any = yield call(authAPI.getProfile);
        if (updatedUser.success && updatedUser.data) {
          yield put(loginSuccess(updatedUser.data));
        }
      } catch (e) {
        console.error("Failed to refresh user profile:", e);
      }
    } else {
      throw new Error(response.message || "Không thể thiết lập SmartOTP");
    }
  } catch (error: any) {
    yield put(setupSmartOtpFailed({ error: error?.response?.data?.message || error.message || "Có lỗi xảy ra" }));
    toastUtils.error(error?.response?.data?.message || "Không thể thiết lập SmartOTP");
  }
}

export function* settingSaga() {
  yield takeLatest(toggle2FAStart.type, handleToggle2FA);
  yield takeLatest(changeOtpMethodStart.type, handleChangeOtpMethod);
  yield takeLatest(changeSmartOtpPasswordStart.type, handleChangeSmartOtpPassword);
  yield takeLatest(setupSmartOtpStart.type, handleSetupSmartOtp);
}

