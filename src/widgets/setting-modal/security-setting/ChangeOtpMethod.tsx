import React from "react";
import { useAppSelector } from "@/app/store";
import { selectIs2FAEnabled } from "@/app/store/slices/setting/setting.selector";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import Button from "@/foundation/components/buttons/Button";
import { Mail, ShieldCheck } from "lucide-react";
import TwoFactorAuth from "./TwoFactorAuth";

interface ChangeOtpMethodProps {
  push?: (screen: any) => void;
  reset?: () => void;
}

const ChangeOtpMethod: React.FC<ChangeOtpMethodProps> = ({ push, reset }) => {
  const user = useAppSelector(selectUser);
  const is2FAEnabled = useAppSelector(selectIs2FAEnabled);

  const handleOpenTwoFactor = () => {
    if (!push) return;
    push({
      title: "Xác minh 2 bước",
      element: <TwoFactorAuth push={push} reset={reset} />,
    });
  };

  return (
    <>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-2">
          <IconCircleWrapper size="md" color="info">
            <Mail className="text-primary-7 dark:text-white" />
          </IconCircleWrapper>
          <div>
            <h2 className="text-2xl font-bold text-neutral-9">Phương thức OTP</h2>
            <p className="text-sm text-neutral-6 mt-0.5">
              Hệ thống hiện cố định phương thức nhận mã OTP qua email
            </p>
          </div>
        </div>

        <AlertMessage
          type="info"
          title="Chỉ sử dụng Email OTP"
          message="Smart OTP đang được bảo trì, mọi mã xác thực sẽ gửi về email đăng ký. Để tăng cường bảo mật đăng nhập, hãy bật xác minh 2 bước trong Auth."
        />

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-background-2 border border-border-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-2">
                  <Mail className="w-5 h-5 text-primary-7" />
                </div>
                <div>
                  <span className="text-base font-semibold text-neutral-9">Email OTP</span>
                  <p className="text-sm text-neutral-6">Nhận mã OTP qua email</p>
                </div>
              </div>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-2 text-primary-7">
                Mặc định
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-background-2 border border-border-2 opacity-60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-2">
                  <ShieldCheck className="w-5 h-5 text-primary-7" />
                </div>
                <div>
                  <span className="text-base font-semibold text-neutral-9">Smart OTP</span>
                  <p className="text-sm text-neutral-6">Tính năng tạm thời không khả dụng</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-neutral-6">
              Chúng tôi đang tối ưu trải nghiệm Smart OTP. Khi tính năng quay trở lại, bạn sẽ nhận được thông báo để
              kích hoạt.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <AlertMessage
            type={is2FAEnabled ? "success" : "warning"}
            title={is2FAEnabled ? "Đã bật xác minh 2 bước" : "Nên bật xác minh 2 bước"}
            message={
              is2FAEnabled
                ? "Bạn đang bảo vệ tài khoản bằng xác minh 2 bước. Tiếp tục duy trì để đảm bảo an toàn."
                : "Bật xác minh 2 bước để yêu cầu OTP mỗi khi đăng nhập và hạn chế truy cập trái phép."
            }
          />
          <div className="flex items-center gap-3">
            <Button variant="outlined" onClick={handleOpenTwoFactor}>
              Quản lý xác minh 2 bước
            </Button>
            <span className="text-sm text-neutral-6">
              Thao tác này sẽ mở màn hình Xác minh 2 bước trong Auth.
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangeOtpMethod;
