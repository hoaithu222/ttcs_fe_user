import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectIs2FAEnabled, selectLogin2FA } from "@/app/store/slices/setting/setting.selector";
import { toggle2FAStart, initializeSetting } from "@/app/store/slices/setting/setting.slice";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import { userOtpApi } from "@/core/api/auth";
import VerifyEmailOtpModal from "@/features/Auth/components/modals/VerifyEmailOtpModal";
import Switch from "@/foundation/components/input/Switch";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import { ShieldCheck } from "lucide-react";
import { ReduxStateType } from "@/app/store/types";

interface TwoFactorAuthProps {
  push?: (screen: any) => void;
  reset?: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const is2FAEnabled = useAppSelector(selectIs2FAEnabled);
  const login2FA = useAppSelector(selectLogin2FA);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(
        initializeSetting({
          twoFactorAuth: user.twoFactorAuth,
        })
      );
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (showOtpModal && user?.email && !otpSent) {
      console.log("[TwoFactorAuth] Requesting OTP for:", user.email);
      userOtpApi
        .request({
          identifier: user.email,
          channel: "email",
          purpose: "verify_setting_change",
        })
        .then((response) => {
          console.log("[TwoFactorAuth] OTP request success:", response);
          setOtpSent(true);
        })
        .catch((error) => {
          console.error("[TwoFactorAuth] OTP request failed:", error);
          // Still set otpSent to true to allow user to try entering OTP
          setOtpSent(true);
        });
    }
  }, [showOtpModal, user?.email, otpSent]);

  const handleResendOtp = () => {
    if (!user?.email) return;
    setResending(true);
    userOtpApi
      .request({
        identifier: user.email,
        channel: "email",
        purpose: "verify_setting_change",
      })
      .then(() => {
        setOtpSent(true);
        setResending(false);
      })
      .catch(() => {
        setResending(false);
      });
  };

  const handleToggle2FA = () => {
    setShowOtpModal(true);
    setOtpSent(false);
  };

  const handleOtpSubmit = (otp: string) => {
    console.log("[TwoFactorAuth] Submitting OTP:", otp);
    dispatch(toggle2FAStart({ otp }));
    // Không đóng modal ngay, để user thấy loading state
    // Modal sẽ tự đóng khi success
  };

  // Đóng modal khi thành công
  useEffect(() => {
    if (login2FA.status === ReduxStateType.SUCCESS && showOtpModal) {
      setShowOtpModal(false);
      setOtpSent(false);
    }
  }, [login2FA.status, showOtpModal]);

  // Đóng modal khi có lỗi (để user có thể thử lại)
  useEffect(() => {
    if (login2FA.status === ReduxStateType.ERROR && showOtpModal) {
      // Giữ modal mở để user có thể thử lại
    }
  }, [login2FA.status, showOtpModal]);

  const isLoading = login2FA.status === ReduxStateType.LOADING;

  return (
    <>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-2">
          <IconCircleWrapper size="md" color="info">
            <ShieldCheck className="text-primary-7 dark:text-white" />
          </IconCircleWrapper>
          <div>
            <h2 className="text-2xl font-bold text-neutral-9">Xác minh 2 bước</h2>
            <p className="text-sm text-neutral-6 mt-0.5">
              Bảo vệ tài khoản của bạn bằng xác minh 2 bước
            </p>
          </div>
        </div>

        <AlertMessage
          type="info"
          title="Bảo mật tài khoản"
          message="Khi bật xác minh 2 bước, bạn sẽ cần nhập mã OTP mỗi khi đăng nhập để tăng cường bảo mật cho tài khoản."
        />

        <div className="flex items-center justify-between p-4 rounded-lg bg-background-2 border border-border-2">
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold text-neutral-9">Trạng thái</span>
            <span className="text-sm text-neutral-6">
              {is2FAEnabled ? "Đã bật xác minh 2 bước" : "Chưa bật xác minh 2 bước"}
            </span>
          </div>
          <Switch
            checked={is2FAEnabled}
            onCheckedChange={handleToggle2FA}
            disabled={isLoading}
          />
        </div>
      </div>

      <VerifyEmailOtpModal
        open={showOtpModal}
        email={user?.email}
        submitting={isLoading}
        resending={resending}
        onClose={() => {
          setShowOtpModal(false);
          setOtpSent(false);
        }}
        onSubmit={handleOtpSubmit}
        onResend={handleResendOtp}
      />
    </>
  );
};

export default TwoFactorAuth;

