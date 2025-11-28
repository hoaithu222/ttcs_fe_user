import { RootState } from "@/app/store";
import { ISettingState } from "./setting.type";
import {
  settingVisibleSelector,
  settingActiveTabSelector,
  defaultSubScreenKeysSelector,
  resetCounterSelector,
} from "./settingSlice";

export const selectSetting = (state: RootState): ISettingState => (state as any).setting;

export const selectLogin2FA = (state: RootState) => selectSetting(state).login2fa;
export const selectOtpMethod = (state: RootState) => selectSetting(state).otp;
export const selectChangePassword = (state: RootState) => selectSetting(state).changePassword;

export const selectIs2FAEnabled = (state: RootState) => selectSetting(state).login2fa.enabled;
export const selectOtpType = (state: RootState) => selectSetting(state).otp.type;

// Re-export UI selectors
export {
  settingVisibleSelector,
  settingActiveTabSelector,
  defaultSubScreenKeysSelector,
  resetCounterSelector,
};

