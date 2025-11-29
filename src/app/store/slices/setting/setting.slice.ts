import { createResettableSlice } from "@/app/store/create-resettabable-slice";
import { AppReducerType, ReduxStateType } from "@/app/store/types";
import { PayloadAction } from "@reduxjs/toolkit";
import { ISettingState } from "./setting.type";

const initialState: ISettingState = {
  login2fa: {
    enabled: false,
    status: ReduxStateType.INIT,
    error: "",
  },
  otp: {
    type: "email",
    status: ReduxStateType.INIT,
    error: "",
  },
  changePassword: {
    status: ReduxStateType.INIT,
    error: "",
  },
};

export const { slice, reducer: settingReducer } = createResettableSlice({
  name: AppReducerType.SETTING || "setting",
  initialState,
  reducers: {
    // Toggle 2FA
    toggle2FAStart: (state, _action: PayloadAction<{ otp: string; desiredEnabled: boolean; smartOtpPassword?: string }>) => {
      state.login2fa.status = ReduxStateType.LOADING;
      state.login2fa.error = "";
    },
    toggle2FASuccess: (state, action: PayloadAction<{ enabled: boolean }>) => {
      state.login2fa.enabled = action.payload.enabled;
      state.login2fa.status = ReduxStateType.SUCCESS;
      state.login2fa.error = "";
    },
    toggle2FAFailed: (state, action: PayloadAction<{ error: string }>) => {
      state.login2fa.status = ReduxStateType.ERROR;
      state.login2fa.error = action.payload.error;
    },

    // Change OTP method
    changeOtpMethodStart: (state, _action: PayloadAction<{ method: "email" | "smart"; otp: string }>) => {
      state.otp.status = ReduxStateType.LOADING;
      state.otp.error = "";
    },
    changeOtpMethodSuccess: (state, action: PayloadAction<{ method: "email" | "smart" }>) => {
      state.otp.type = action.payload.method;
      state.otp.status = ReduxStateType.SUCCESS;
      state.otp.error = "";
    },
    changeOtpMethodFailed: (state, action: PayloadAction<{ error: string }>) => {
      state.otp.status = ReduxStateType.ERROR;
      state.otp.error = action.payload.error;
    },

    // Change SmartOTP password
    changeSmartOtpPasswordStart: (state, _action: PayloadAction<{ newPassword: string; otp: string }>) => {
      state.changePassword.status = ReduxStateType.LOADING;
      state.changePassword.error = "";
    },
    changeSmartOtpPasswordSuccess: (state) => {
      state.changePassword.status = ReduxStateType.SUCCESS;
      state.changePassword.error = "";
    },
    changeSmartOtpPasswordFailed: (state, action: PayloadAction<{ error: string }>) => {
      state.changePassword.status = ReduxStateType.ERROR;
      state.changePassword.error = action.payload.error;
    },

    // Setup SmartOTP (first time)
    setupSmartOtpStart: (state, _action: PayloadAction<{ password: string; otp: string }>) => {
      state.otp.status = ReduxStateType.LOADING;
      state.otp.error = "";
    },
    setupSmartOtpSuccess: (state) => {
      state.otp.type = "smart";
      state.otp.status = ReduxStateType.SUCCESS;
      state.otp.error = "";
    },
    setupSmartOtpFailed: (state, action: PayloadAction<{ error: string }>) => {
      state.otp.status = ReduxStateType.ERROR;
      state.otp.error = action.payload.error;
    },

    // Initialize from user data
    initializeSetting: (state, action: PayloadAction<{ twoFactorAuth?: boolean; otpMethod?: "email" | "smart_otp" }>) => {
      if (typeof action.payload.twoFactorAuth === "boolean") {
        state.login2fa.enabled = action.payload.twoFactorAuth;
      }
      if (action.payload.otpMethod) {
        state.otp.type = action.payload.otpMethod === "smart_otp" ? "smart" : "email";
      }
    },
  },
});

export const {
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
  initializeSetting,
} = slice.actions;

