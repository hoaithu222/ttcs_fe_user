import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { ILoginStep } from "@/features/Auth/components/slice/auth.types";
import {
  selectUser,
  selectLoginStep,
  selectIsLoadingLogin,
} from "@/features/Auth/components/slice/auth.selector";
import {
  submitPostLoginOtp,
  resendPostLoginOtp,
  logoutUser,
} from "@/features/Auth/components/slice/auth.slice";
import { toastUtils } from "@/shared/utils/toast.utils";
import VerifyEmailOtpModal from "./VerifyEmailOtpModal";
import PostLoginSmartOtpModal from "./PostLoginSmartOtpModal";
import { setVisibleModalSetting, setActiveTabSetting, TabSetting } from "@/app/store/slices/setting/settingSlice";

const PostLoginOtpManager = () => {
  const dispatch = useAppDispatch();
  const loginStep = useAppSelector(selectLoginStep);
  const user = useAppSelector(selectUser);
  const isLoadingLogin = useAppSelector(selectIsLoadingLogin);

  const shouldShowOtpModal = loginStep === ILoginStep.VERIFY_2FA && user && !user.isFirstLogin;
  const submitting = isLoadingLogin;
  const resending = false;

  // Check if user uses Smart OTP but hasn't set it up
  useEffect(() => {
    if (shouldShowOtpModal && user) {
      if (user.otpMethod === "smart_otp" && !user.smartOtpSecret) {
        toastUtils.info("Bạn cần thiết lập mật khẩu Smart OTP trước. Đang chuyển đến cài đặt...");
        dispatch(setVisibleModalSetting(true));
        dispatch(setActiveTabSetting(TabSetting.SECURITY));
      }
    }
  }, [shouldShowOtpModal, user, dispatch]);

  const handleOtpSubmit = (token: string) => {
    dispatch(submitPostLoginOtp({ code: token }));
  };

  const handleResendOtp = () => {
    dispatch(resendPostLoginOtp());
  };

  const handleCloseModal = () => {
    toastUtils.info("Bạn đã hủy xác minh OTP. Đang đăng xuất...");
    dispatch(logoutUser());
  };

  if (!shouldShowOtpModal) {
    return null;
  }

  // If user uses Smart OTP but hasn't set it up, don't show modal (redirected to settings)
  if (user?.otpMethod === "smart_otp" && !user.smartOtpSecret) {
    return null;
  }

  // Show Smart OTP modal if user uses Smart OTP
  if (user?.otpMethod === "smart_otp") {
    return (
      <PostLoginSmartOtpModal
        visible={true}
        onClose={() => {
          // Don't allow closing - user must verify OTP
          toastUtils.warning("Vui lòng nhập mã OTP để hoàn tất đăng nhập.");
        }}
      />
    );
  }

  // Use VerifyEmailOtpModal for email OTP
  return (
    <VerifyEmailOtpModal
      open={true}
      email={user?.email || ""}
      submitting={submitting}
      resending={resending}
      onClose={() => {
        handleCloseModal();
      }}
      onSubmit={handleOtpSubmit}
      onResend={handleResendOtp}
      title="Xác minh đăng nhập"
      description="Nhập mã OTP 6 số đã được gửi đến email của bạn để hoàn tất đăng nhập."
      infoMessage={
        <>
          Mã OTP 6 số đã được gửi đến{" "}
          <strong className="text-primary-7">{user?.email || "email của bạn"}</strong>. Vui lòng nhập mã để
          xác nhận đăng nhập. Mã có hiệu lực trong <strong>10 phút</strong>.
        </>
      }
      confirmText="Hoàn tất đăng nhập"
    />
  );
};

export default PostLoginOtpManager;

