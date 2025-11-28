import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  acknowledgeTwoFactorReminder,
  skipTwoFactorReminder,
  markFirstLoginComplete,
} from "@/features/Auth/components/slice/auth.slice";
import {
  selectFirstLoginFlow,
  selectUser,
} from "@/features/Auth/components/slice/auth.selector";
import FirstLoginTwoFactorModal from "./FirstLoginTwoFactorModal";
import { userAuthApi } from "@/core/api/auth";
import { setVisibleModalSetting, setActiveTabSetting, TabSetting } from "@/app/store/slices/setting/settingSlice";

const FirstLoginFlowManager = () => {
  const dispatch = useAppDispatch();
  const flow = useAppSelector(selectFirstLoginFlow);
  const user = useAppSelector(selectUser);

  const handleTwoFactorContinue = async () => {
    dispatch(acknowledgeTwoFactorReminder());
    try {
      await userAuthApi.updateProfile({ isFirstLogin: false });
      dispatch(markFirstLoginComplete());
    } catch (error) {
      console.error("Failed to update first login status:", error);
      dispatch(markFirstLoginComplete());
    } finally {
      dispatch(setVisibleModalSetting(true));
      dispatch(setActiveTabSetting(TabSetting.SECURITY));
    }
  };

  const handleTwoFactorSkip = async () => {
    dispatch(skipTwoFactorReminder());
    try {
      await userAuthApi.updateProfile({ isFirstLogin: false });
      dispatch(markFirstLoginComplete());
    } catch (error) {
      console.error("Failed to update first login status:", error);
      dispatch(markFirstLoginComplete());
    }
  };

  return (
    <>
      {/* Modal 1: Khuyên bật xác minh 2 bước */}
      <FirstLoginTwoFactorModal
        open={flow.show2FAReminder && Boolean(user?.isFirstLogin)}
        onSkip={handleTwoFactorSkip}
        onContinue={handleTwoFactorContinue}
      />
    </>
  );
};

export default FirstLoginFlowManager;

