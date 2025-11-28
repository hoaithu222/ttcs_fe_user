import Modal from "@/foundation/components/modal/Modal";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import { KeyRound } from "lucide-react";

interface SmartOtpRecommendModalProps {
  open: boolean;
  onSkip: () => void;
  onContinue: () => void;
}

const SmartOtpRecommendModal = ({
  open,
  onSkip,
  onContinue,
}: SmartOtpRecommendModalProps) => {
  return (
    <Modal
      open={open}
      onOpenChange={(val) => !val && onSkip()}
      size="2xl"
      customTitle={
        <div className="flex gap-3 items-center">
          <IconCircleWrapper size="md" color="info">
            <KeyRound className="text-primary-7 dark:text-white" />
          </IconCircleWrapper>
          <div>
            <h2 className="text-xl font-bold text-neutral-9">Khuyên dùng Smart OTP</h2>
            <p className="text-sm text-neutral-6 mt-0.5">
              Phương thức xác thực nhanh chóng và tiện lợi hơn
            </p>
          </div>
        </div>
      }
      onCancel={onSkip}
      onConfirm={onContinue}
      closeText="Để sau"
      confirmText="Tìm hiểu thêm"
      hideFooter={false}
      titleClassName="!text-xl"
      headerPadding="pb-6"
    >
      <div className="space-y-4">
        <AlertMessage
          type="info"
          title="Thông tin quan trọng"
          message="Smart OTP cho phép bạn tạo mã xác thực ngay trên thiết bị của mình mà không cần chờ email. Bạn có thể thiết lập Smart OTP bất cứ lúc nào trong phần Cài đặt."
        />

        <div className="space-y-3">
          <div className="flex gap-3 items-start p-3 rounded-lg bg-background-2 border border-neutral-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-6 flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div>
              <p className="text-base font-semibold text-neutral-9">Nhanh chóng và tiện lợi</p>
              <p className="text-sm text-neutral-6 mt-1">
                Tạo mã OTP ngay trên thiết bị của bạn, không cần chờ email
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-3 rounded-lg bg-background-2 border border-neutral-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-6 flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <div>
              <p className="text-base font-semibold text-neutral-9">Bảo mật cao</p>
              <p className="text-sm text-neutral-6 mt-1">
                Mã OTP được tạo từ mật khẩu Smart OTP của bạn, chỉ bạn mới biết
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-3 rounded-lg bg-background-2 border border-neutral-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-6 flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <div>
              <p className="text-base font-semibold text-neutral-9">Hoạt động offline</p>
              <p className="text-sm text-neutral-6 mt-1">
                Không cần kết nối internet để tạo mã OTP
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SmartOtpRecommendModal;

