import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Screen } from "@/widgets/setting-modal/type";

export enum TabSetting {
  GENERAL = "GENERAL",
  ACCOUNT = "ACCOUNT",
  SECURITY = "SECURITY",
  NOTIFICATION = "NOTIFICATION",
  SHORTCUTS = "SHORTCUTS",
  INFO = "INFO",
  CACHE = "CACHE",
}

interface SettingUIState {
  visible: boolean;
  activeTab: TabSetting;
  subScreens: Screen[];
  defaultSubScreenKeys: string[];
  resetCounter: number;
}

const initialState: SettingUIState = {
  visible: false,
  activeTab: TabSetting.GENERAL,
  subScreens: [],
  defaultSubScreenKeys: [],
  resetCounter: 0,
};

const settingUISlice = createSlice({
  name: "settingUI",
  initialState,
  reducers: {
    setVisibleModalSetting: (state, action: PayloadAction<boolean>) => {
      state.visible = action.payload;
    },
    setActiveTabSetting: (state, action: PayloadAction<TabSetting>) => {
      state.activeTab = action.payload;
    },
    setSubScreens: (state, action: PayloadAction<Screen[]>) => {
      state.subScreens = action.payload;
    },
    setDefaultSubScreenKeys: (state, action: PayloadAction<string[]>) => {
      state.defaultSubScreenKeys = action.payload;
    },
    forceResetNavigation: (state) => {
      state.resetCounter += 1;
    },
  },
});

export const {
  setVisibleModalSetting,
  setActiveTabSetting,
  setSubScreens,
  setDefaultSubScreenKeys,
  forceResetNavigation,
} = settingUISlice.actions;

// Selectors
export const settingVisibleSelector = (state: any) => state.settingUI?.visible ?? false;
export const settingActiveTabSelector = (state: any) => state.settingUI?.activeTab ?? TabSetting.GENERAL;
export const defaultSubScreenKeysSelector = (state: any) => state.settingUI?.defaultSubScreenKeys ?? [];
export const resetCounterSelector = (state: any) => state.settingUI?.resetCounter ?? 0;

export default settingUISlice.reducer;

