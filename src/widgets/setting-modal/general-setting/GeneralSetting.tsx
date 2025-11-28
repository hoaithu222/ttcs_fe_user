import React from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import Switch from "@/foundation/components/input/Switch";
import { Settings, Moon, Sun, Globe } from "lucide-react";
import { toggleTheme, setTheme } from "@/app/store/slices/theme";
import { setLanguage } from "@/app/store/slices/language";
import { themeRootSelector } from "@/app/store/slices/theme/selectors";
import { selectLanguage } from "@/app/store/slices/language/selectors";
import { RootState } from "@/app/store";
import { toastUtils } from "@/shared/utils/toast.utils";

const GeneralSetting: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state: RootState) => themeRootSelector(state));
  const language = useAppSelector(selectLanguage);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    toastUtils.success(`Đã chuyển sang chế độ ${theme === "light" ? "tối" : "sáng"}`);
  };

  const handleSetTheme = (newTheme: "light" | "dark") => {
    dispatch(setTheme(newTheme));
    toastUtils.success(`Đã chuyển sang chế độ ${newTheme === "light" ? "sáng" : "tối"}`);
  };

  const handleSetLanguage = (newLanguage: "vi" | "en") => {
    dispatch(setLanguage(newLanguage));
    toastUtils.success(`Đã chuyển sang ngôn ngữ ${newLanguage === "vi" ? "Tiếng Việt" : "English"}`);
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <IconCircleWrapper size="md" color="info">
          <Settings className="text-primary-7 dark:text-white" />
        </IconCircleWrapper>
        <div>
          <h2 className="text-2xl font-bold text-neutral-9">Cài đặt chung</h2>
          <p className="text-sm text-neutral-6 mt-0.5">
            Quản lý các cài đặt chung của ứng dụng
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Theme Setting */}
        <div className="p-4 rounded-lg bg-background-2 border border-border-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-2">
                {theme === "light" ? (
                  <Sun className="w-5 h-5 text-primary-7" />
                ) : (
                  <Moon className="w-5 h-5 text-primary-7" />
                )}
              </div>
              <div>
                <span className="text-base font-semibold text-neutral-9">Giao diện</span>
                <p className="text-sm text-neutral-6">Chọn chế độ sáng hoặc tối</p>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={handleToggleTheme}
            />
          </div>
          <div className="flex gap-2 pt-3 border-t border-border-2">
            <button
              onClick={() => handleSetTheme("light")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                theme === "light"
                  ? "bg-primary-2 text-primary-7 border border-primary-3"
                  : "bg-background-1 text-neutral-6 border border-border-2 hover:bg-background-2"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Sun className="w-4 h-4" />
                <span>Sáng</span>
              </div>
            </button>
            <button
              onClick={() => handleSetTheme("dark")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                theme === "dark"
                  ? "bg-primary-2 text-primary-7 border border-primary-3"
                  : "bg-background-1 text-neutral-6 border border-border-2 hover:bg-background-2"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Moon className="w-4 h-4" />
                <span>Tối</span>
              </div>
            </button>
          </div>
        </div>

        {/* Language Setting */}
        {/* <div className="p-4 rounded-lg bg-background-2 border border-border-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-2">
                <Globe className="w-5 h-5 text-primary-7" />
              </div>
              <div>
                <span className="text-base font-semibold text-neutral-9">Ngôn ngữ</span>
                <p className="text-sm text-neutral-6">Chọn ngôn ngữ hiển thị</p>
              </div>
            </div>
            <span className="text-sm font-medium text-neutral-6">
              {language === "vi" ? "Tiếng Việt" : "English"}
            </span>
          </div>
          <div className="flex gap-2 pt-3 border-t border-border-2">
            <button
              onClick={() => handleSetLanguage("vi")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                language === "vi"
                  ? "bg-primary-2 text-primary-7 border border-primary-3"
                  : "bg-background-1 text-neutral-6 border border-border-2 hover:bg-background-2"
              }`}
            >
              Tiếng Việt
            </button>
            <button
              onClick={() => handleSetLanguage("en")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                language === "en"
                  ? "bg-primary-2 text-primary-7 border border-primary-3"
                  : "bg-background-1 text-neutral-6 border border-border-2 hover:bg-background-2"
              }`}
            >
              English
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default GeneralSetting;

