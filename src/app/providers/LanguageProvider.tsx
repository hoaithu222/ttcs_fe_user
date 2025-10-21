import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useEffect } from "react";
import i18n from "@/i18n";
import { Language } from "../store/slices/language/types";

const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useSelector((state: RootState) => state.language);
  useEffect(() => {
    i18n.changeLanguage(language as Language);
  }, [language]);

  return <div>{children}</div>;
};

export default LanguageProvider;
