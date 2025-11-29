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
import Modal from "@/foundation/components/modal/Modal";
import { ShieldCheck, AlertTriangle } from "lucide-react";
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
   const [pendingEnabled, setPendingEnabled] = useState<boolean | null>(null);
  const [hasSubmittedOtp, setHasSubmittedOtp] = useState(false);

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
    console.log("[TwoFactorAuth] handleResendOtp called for:", user.email);
    setResending(true);
    userOtpApi
      .request({
        identifier: user.email,
        channel: "email",
        purpose: "verify_setting_change",
      })
      .then(() => {
        console.log("[TwoFactorAuth] Resend OTP success");
        setOtpSent(true);
        setResending(false);
      })
      .catch((error) => {
        console.error("[TwoFactorAuth] Resend OTP failed:", error);
        setResending(false);
      });
  };

  const [showDisableWarning, setShowDisableWarning] = useState(false);

  const handleToggle2FA = (nextChecked: boolean) => {
    console.log("[TwoFactorAuth] handleToggle2FA called, nextChecked:", nextChecked, "current is2FAEnabled:", is2FAEnabled);
    setPendingEnabled(nextChecked);
    setHasSubmittedOtp(false);

    if (!nextChecked) {
      // User muốn tắt 2FA -> hiển thị cảnh báo trước
      setShowDisableWarning(true);
      setShowOtpModal(false);
      setOtpSent(false);
    } else {
      // User muốn bật 2FA -> mở luôn modal OTP
      setShowDisableWarning(false);
      setShowOtpModal(true);
      setOtpSent(false);
    }
  };

  const handleOtpSubmit = (otp: string) => {
    console.log("[TwoFactorAuth] Submitting OTP:", otp);
    setHasSubmittedOtp(true);
    const desiredEnabled = pendingEnabled ?? !is2FAEnabled;
    dispatch(toggle2FAStart({ otp, desiredEnabled }));
    // Không đóng modal ngay, để user thấy loading state
    // Modal sẽ tự đóng khi success
  };

  // Đóng modal khi thành công
  useEffect(() => {
    console.log(
      "[TwoFactorAuth] login2FA.status changed:",
      login2FA.status,
      "showOtpModal:",
      showOtpModal
    );
    if (login2FA.status === ReduxStateType.SUCCESS && showOtpModal && hasSubmittedOtp) {
      console.log("[TwoFactorAuth] Closing OTP modal on SUCCESS after submit");
      setShowOtpModal(false);
      setOtpSent(false);
      setHasSubmittedOtp(false);
    }
  }, [login2FA.status, showOtpModal, hasSubmittedOtp]);

  // Đóng modal khi có lỗi (để user có thể thử lại)
  useEffect(() => {
    if (login2FA.status === ReduxStateType.ERROR && showOtpModal) {
      // Giữ modal mở để user có thể thử lại
    }
  }, [login2FA.status, showOtpModal]);

  const isLoading = login2FA.status === ReduxStateType.LOADING;

  console.log("[TwoFactorAuth][render] showOtpModal:", showOtpModal);
  console.log("[TwoFactorAuth][render] is2FAEnabled:", is2FAEnabled);
  console.log("[TwoFactorAuth][render] login2FA.status:", login2FA.status);
  console.log("[TwoFactorAuth][render] user.email:", user?.email);

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
          setHasSubmittedOtp(false);
          setPendingEnabled(null);
        }}
        onSubmit={handleOtpSubmit}
        onResend={handleResendOtp}
        title="Xác nhận thay đổi bảo mật"
        description="Nhập mã OTP được gửi đến email của bạn để xác nhận thay đổi thiết lập bảo mật."
        infoMessage={
          <>
            Mã OTP 6 số đã được gửi đến{" "}
            <strong className="text-primary-7">{user?.email ?? "email của bạn"}</strong>. Vui lòng nhập mã để
            xác nhận thay đổi bảo mật. Mã có hiệu lực trong <strong>10 phút</strong>.
          </>
        }
        confirmText="Xác nhận thay đổi"
      />

      <Modal
        open={showDisableWarning}
        onOpenChange={(val) => {
          if (!val) {
            setShowDisableWarning(false);
          }
        }}
        size="lg"
        customTitle={
          <div className="flex gap-3 items-center">
            <IconCircleWrapper size="md" color="warning">
              <AlertTriangle className="text-warning-7 dark:text-white" />
            </IconCircleWrapper>
            <div>
              <h2 className="text-xl font-bold text-neutral-9">Tắt xác minh 2 bước</h2>
             
            </div>
          </div>
        }
        onCancel={() => {
          setShowDisableWarning(false);
          setPendingEnabled(null);
        }}
        onConfirm={() => {
          setShowDisableWarning(false);
          setShowOtpModal(true);
          setOtpSent(false);
          setHasSubmittedOtp(false);
        }}
        closeText="Giữ lại 2FA"
        confirmText="Tiếp tục tắt"
      >
        <div className="space-y-3">
          <AlertMessage
            type="warning"
            title="Bạn có chắc chắn muốn tắt xác minh 2 bước?"
            message="Khi tắt xác minh 2 bước, tài khoản của bạn sẽ chỉ được bảo vệ bằng mật khẩu. Chúng tôi khuyến nghị bạn nên giữ 2FA để tăng cường bảo mật."
          />
          <p className="text-sm text-neutral-6">
            Nếu bạn vẫn muốn tắt, hãy chọn <span className="font-semibold text-warning-7">Tiếp tục tắt</span> và xác
            nhận bằng mã OTP.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default TwoFactorAuth;

