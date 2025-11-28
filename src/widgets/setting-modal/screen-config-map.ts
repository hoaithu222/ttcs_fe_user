import { TabSetting } from "@/app/store/slices/setting/settingSlice";
import { Screen } from "./type";

export const screenConfigMap: Record<TabSetting, Screen[]> = {
  [TabSetting.GENERAL]: [],
  [TabSetting.ACCOUNT]: [],
  [TabSetting.SECURITY]: [],
  [TabSetting.NOTIFICATION]: [],
  [TabSetting.SHORTCUTS]: [],
  [TabSetting.INFO]: [],
  [TabSetting.CACHE]: [],
};

