import React from "react";
import clsx from "clsx";
import Modal from "@/foundation/components/modal/Modal";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import Switch from "@/foundation/components/input/Switch";
import { Mail, Shield } from "lucide-react";

type OtpMethod = "email" | "smart";

interface OtpMethodSelectorModalProps {
  open: boolean;
  selectedMethod: OtpMethod;
  enableTwoFactor: boolean;
  submitting: boolean;
  onSelect: (method: OtpMethod) => void;
  onToggleTwoFactor: (value: boolean) => void;
  onBack: () => void;
  onConfirm: () => void;
}

const METHOD_ITEMS: Array<{
  key: OtpMethod;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    key: "email",
    title: "Email OTP",
    description: "Gửi mã OTP qua email đã đăng ký. Phù hợp với mọi người dùng.",
    icon: <Mail className="w-5 h-5 text-primary-7" />,
  },
  {
    key: "smart",
    title: "Smart OTP",
    description: "Sinh mã ngay trên thiết bị của bạn, nhanh và bảo mật hơn.",
    icon: <Shield className="w-5 h-5 text-primary-7" />,
  },
];

const OtpMethodSelectorModal = ({
  open,
  selectedMethod,
  enableTwoFactor,
  submitting,
  onSelect,
  onToggleTwoFactor,
  onBack,
  onConfirm,
}: OtpMethodSelectorModalProps) => {
  return (
    <Modal
      open={open}
      onOpenChange={(val) => !val && onBack()}
      size="2xl"
      customTitle={
        <div className="flex gap-3 items-center">
          <IconCircleWrapper size="md" color="info">
            <Shield className="text-primary-7 dark:text-white" />
          </IconCircleWrapper>
          <div>
            <p className="text-xs text-primary-6 font-semibold mb-1">Bước 2/2</p>
            <h2 className="text-xl font-bold text-neutral-9">Chọn phương thức nhận mã OTP</h2>
            <p className="text-sm text-neutral-6 mt-0.5">
              Mặc định chúng tôi sử dụng Email OTP. Bạn có thể chuyển sang Smart OTP bất cứ lúc nào.
            </p>
          </div>
        </div>
      }
      onCancel={onBack}
      onConfirm={onConfirm}
      closeText="Quay lại"
      confirmText={submitting ? "Đang lưu..." : "Tiếp tục"}
      hideFooter={false}
      disabled={submitting}
      titleClassName="!text-xl"
      headerPadding="pb-6"
    >
      <div className="space-y-4">
        <AlertMessage
          type="info"
          title="Thông tin quan trọng"
          message="Mặc định chúng tôi sử dụng Email OTP. Bạn có thể chuyển sang Smart OTP bất cứ lúc nào trong cài đặt tài khoản."
        />

        <div className="space-y-3">
          {METHOD_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={clsx(
                "w-full flex gap-4 p-4 border rounded-xl text-left transition-all",
                selectedMethod === item.key
                  ? "border-primary-5 bg-primary-1/40 shadow-sm"
                  : "border-neutral-3 hover:border-primary-3 bg-background-1"
              )}
            >
              <div className="flex justify-center items-center w-12 h-12 rounded-xl bg-primary-1">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-base font-semibold text-neutral-9">
                    {item.title}
                  </p>
                  {item.key === "email" && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary-2 text-primary-7 font-medium">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-6">{item.description}</p>
              </div>
              <div className="ml-auto flex items-center">
                <span
                  className={clsx(
                    "inline-block w-4 h-4 rounded-full border-2 transition-all",
                    selectedMethod === item.key
                      ? "bg-primary-6 border-primary-6"
                      : "bg-background-1 border-neutral-4"
                  )}
                />
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center p-4 rounded-xl border border-neutral-3 bg-background-2">
          <div className="text-left">
            <p className="text-base font-semibold text-neutral-9 mb-1">Bật xác thực 2 lớp</p>
            <p className="text-sm text-neutral-6">
              Yêu cầu OTP mỗi lần đăng nhập để bảo vệ tài khoản.
            </p>
          </div>
          <Switch checked={enableTwoFactor} onCheckedChange={onToggleTwoFactor} />
        </div>
      </div>
    </Modal>
  );
};

export default OtpMethodSelectorModal;


