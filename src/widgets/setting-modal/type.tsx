import { TabSetting } from "@/app/store/slices/setting/settingSlice";

import { ScreenKey } from "./screen-config-map";

export interface SettingItem {
  key: TabSetting;
  label: string;
  icon: string;
  content: React.ReactNode;
}
export interface Screen {
  key?: ScreenKey;
  title?: string;
  element: React.ReactNode;
  name?: string; // tên de dich
  type?: string; // type của screen
}

export interface SettingContentStackProps {
  initialScreen: Screen;
  initialSubScreens?: Screen[];
  resetCounter?: number;
}
