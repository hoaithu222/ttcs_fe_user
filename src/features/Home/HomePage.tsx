import { RootState } from "@/app/store";
import { setLanguage } from "@/app/store/slices/language";
import { Language } from "@/app/store/slices/language/types";
import { toggleTheme } from "@/app/store/slices/theme";
import { themeRootSelector } from "@/app/store/slices/theme/selectors";
import Button from "@/foundation/components/buttons/Button";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

const HomePage = () => {
  const { t } = useTranslation("home");

  const { theme } = useSelector((state: RootState) => themeRootSelector(state));
  const dispatch = useDispatch();

  const handleChangeLanguage = (language: string) => {
    dispatch(setLanguage(language as Language));
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
    </div>
  );
};

export default HomePage;
