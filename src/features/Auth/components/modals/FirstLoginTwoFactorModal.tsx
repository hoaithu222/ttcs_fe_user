import Modal from "@/foundation/components/modal/Modal";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import { ShieldCheck } from "lucide-react";

interface FirstLoginTwoFactorModalProps {
  open: boolean;
  onSkip: () => void;
  onContinue: () => void;
}

const FirstLoginTwoFactorModal = ({
  open,
  onSkip,
  onContinue,
}: FirstLoginTwoFactorModalProps) => {
  return (
    <Modal
      open={open}
      onOpenChange={(val) => !val && onSkip()}
      size="2xl"
      customTitle={
        <div className="flex gap-3 items-center">
          <IconCircleWrapper size="md" color="info">
            <ShieldCheck className="text-primary-7 dark:text-white" />
          </IconCircleWrapper>
          <div>
            <h2 className="text-xl font-bold text-neutral-9">Bảo vệ tài khoản của bạn</h2>
            <p className="text-sm text-neutral-6 mt-0.5">
              Thiết lập xác thực 2 lớp để tăng cường bảo mật
            </p>
          </div>
        </div>
      }
      onCancel={onSkip}
      onConfirm={onContinue}
      closeText="Để sau"
      confirmText="Thiết lập ngay"
      hideFooter={false}
      titleClassName="!text-xl"
      headerPadding="pb-6"
    >
      <div className="space-y-4">
        <AlertMessage
          type="info"
          title="Thông tin quan trọng"
          message="Lần đăng nhập đầu tiên luôn là thời điểm tốt nhất để bật xác thực 2 lớp. Chúng tôi khuyến nghị bạn thiết lập ngay để tài khoản an toàn hơn."
        />

        <div className="space-y-3">
          <div className="flex gap-3 items-start p-3 rounded-lg bg-background-2 border border-neutral-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-6 flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div>
              <p className="text-base font-semibold text-neutral-9">Ngăn chặn đăng nhập trái phép</p>
              <p className="text-sm text-neutral-6 mt-1">
                Bảo vệ tài khoản khỏi các cuộc tấn công và truy cập không được phép
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-3 rounded-lg bg-background-2 border border-neutral-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-6 flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <div>
              <p className="text-base font-semibold text-neutral-9">Nhắc nhở khi có hoạt động bất thường</p>
              <p className="text-sm text-neutral-6 mt-1">
                Nhận thông báo ngay khi có đăng nhập từ thiết bị hoặc địa điểm mới
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-3 rounded-lg bg-background-2 border border-neutral-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-6 flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <div>
              <p className="text-base font-semibold text-neutral-9">Luôn nhận cảnh báo đăng nhập</p>
              <p className="text-sm text-neutral-6 mt-1">
                Bật 2FA giúp bạn nhận email OTP mỗi lần đăng nhập và phát hiện ngay thiết bị lạ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FirstLoginTwoFactorModal;

