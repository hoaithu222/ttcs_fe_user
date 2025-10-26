import { RootState } from "@/app/store";
import { setLanguage } from "@/app/store/slices/language";
import { Language } from "@/app/store/slices/language/types";
import { toggleTheme } from "@/app/store/slices/theme";
import { themeRootSelector } from "@/app/store/slices/theme/selectors";
import Button from "@/foundation/components/buttons/Button";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { toastUtils } from "@/shared/utils/toast.utils";

const HomePage = () => {
  const { t } = useTranslation("home");

  const { theme } = useSelector((state: RootState) => themeRootSelector(state));
  const dispatch = useDispatch();

  const handleChangeLanguage = (language: string) => {
    dispatch(setLanguage(language as Language));
  };

  const handleTestToast = (type: "success" | "error" | "warning" | "info") => {
    switch (type) {
      case "success":
        toastUtils.success("Thao tác thành công!");
        break;
      case "error":
        toastUtils.error("Đã xảy ra lỗi!");
        break;
      case "warning":
        toastUtils.warning("Cảnh báo!");
        break;
      case "info":
        toastUtils.info("Thông tin!");
        break;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold bg-background-base">{t("title")}</h1>
      <p className="text-sm text-gray-400 bg-red-400">{t("description")}</p>
      <div className="mt-4 space-x-2">
        <Button onClick={() => handleChangeLanguage("en")}>English</Button>
        <Button onClick={() => handleChangeLanguage("vi")}>Vietnamese</Button>
        <Button onClick={() => dispatch(toggleTheme())}>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>
      </div>

      {/* Toast Test Buttons */}
      <div className="mt-6 space-x-2">
        <h3 className="mb-2 text-lg font-semibold">Test Toast:</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleTestToast("success")} variant="solid">
            Success Toast
          </Button>
          <Button onClick={() => handleTestToast("error")} variant="solid">
            Error Toast
          </Button>
          <Button onClick={() => handleTestToast("warning")} variant="solid">
            Warning Toast
          </Button>
          <Button onClick={() => handleTestToast("info")} variant="solid">
            Info Toast
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
