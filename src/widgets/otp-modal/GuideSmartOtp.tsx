import { useTranslation } from "react-i18next";

const GuideSmartOtp = () => {
  const { t } = useTranslation("login");
  return (
    <div className="w-full p-4 text-sm text-left border rounded-lg border-border-2 bg-background-1">
      <span className="mb-2 text-body-14 text-neutral-8">
        {t("warning-two-factor.description.titleList")}
      </span>
      <ul className="pl-5 space-y-1 list-disc text-body-14 text-neutral-7">
        <li>
          <span>{t("warning-two-factor.description.step1")}</span>
        </li>
        <li>
          <span>{t("warning-two-factor.description.step2")}</span>
        </li>
        <li>
          <span>{t("warning-two-factor.description.step3")}</span>
        </li>
      </ul>
    </div>
  );
};

export default GuideSmartOtp;
