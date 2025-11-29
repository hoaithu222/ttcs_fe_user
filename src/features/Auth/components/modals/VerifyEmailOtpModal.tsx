import { ReactNode, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import Modal from "@/foundation/components/modal/Modal";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import PinInput from "@/widgets/otp-modal/PinInput";
import { Mail } from "lucide-react";

interface VerifyEmailOtpModalProps {
  open: boolean;
  email?: string;
  submitting: boolean;
  resending: boolean;
  onClose: () => void;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  title?: string;
  description?: string;
  infoMessage?: ReactNode;
  confirmText?: string;
}

const VerifyEmailOtpModal = ({
  open,
  email,
  submitting,
  resending,
  onClose,
  onSubmit,
  onResend,
  title = "Xác minh email",
  description = "Nhập mã OTP 6 số đã được gửi đến email của bạn",
  infoMessage,
  confirmText = "Xác nhận",
}: VerifyEmailOtpModalProps) => {
  console.log(
    "[VerifyEmailOtpModal][render] open:",
    open,
    "email:",
    email,
    "submitting:",
    submitting,
    "resending:",
    resending
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm<{ otp: string }>({
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (!open) {
      reset({ otp: "" });
    }
  }, [open, reset]);

  const otpValue = watch("otp");
  const isDisabled = !otpValue || otpValue.length < 6 || submitting;

  return (
    <Modal
      open={open}
      onOpenChange={(val) => {
        console.log("[VerifyEmailOtpModal] onOpenChange called, val:", val, "submitting:", submitting);
        if (!val && !submitting) {
          onClose();
        }
      }}
      size="lg"
      customTitle={
        <div className="flex gap-3 items-center">
          <IconCircleWrapper size="md" color="info">
            <Mail className="text-primary-7 dark:text-white" />
          </IconCircleWrapper>
          <div>
            <h2 className="text-xl font-bold text-neutral-9">{title}</h2>
          </div>
        </div>
      }
      onCancel={onClose}
      onConfirm={handleSubmit(({ otp }) => onSubmit(otp))}
      closeText="Để sau"
      confirmText={submitting ? "Đang xác minh..." : confirmText}
      hideFooter={false}
      disabled={isDisabled || submitting}
      titleClassName="!text-xl"
      headerPadding="pb-6"
    >
      <div className="space-y-4">
        <AlertMessage
          type="info"
          title="Mã OTP đã được gửi"
          message={
            infoMessage ?? (
              <>
                Mã OTP 6 số đã được gửi đến{" "}
                <strong className="text-primary-7">{email ?? "email của bạn"}</strong>. Vui lòng kiểm tra hộp thư
                và nhập mã để xác minh. Mã có hiệu lực trong <strong>10 phút</strong>.
              </>
            )
          }
        />

        <Controller
          name="otp"
          control={control}
          rules={{
            required: "OTP là bắt buộc",
            minLength: { value: 6, message: "OTP phải có 6 ký tự" },
          }}
          render={({ field }) => (
            <PinInput {...field} length={6} onChange={(value) => field.onChange(value)} />
          )}
        />

        <div className="flex justify-between items-center text-sm">
          <span className="text-neutral-6">Bạn chưa nhận được mã?</span>
          <button
            type="button"
            className="font-semibold text-primary-6 hover:text-primary-7 disabled:text-neutral-5 disabled:cursor-not-allowed transition-colors"
            onClick={onResend}
            disabled={resending || !email}
          >
            {resending ? "Đang gửi..." : "Gửi lại OTP"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VerifyEmailOtpModal;

