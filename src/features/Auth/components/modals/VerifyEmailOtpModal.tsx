import { ReactNode, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import Modal from "@/foundation/components/modal/Modal";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
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
      contentClassName="bg-background-1 border-border-1"
      customTitle={
        <div className="flex gap-3 items-center">
          <IconCircleWrapper size="md" extraBorder={true} color="info" borderWidth="border-2">
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
        <div className="rounded-lg border border-primary-3 bg-primary-1 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-full bg-background-1 p-1">
              <div className="text-primary-7">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-primary-7 mb-1">Mã OTP đã được gửi</div>
              <div className="text-sm text-neutral-7">
                {infoMessage ?? (
                  <>
                    Mã OTP 6 số đã được gửi đến{" "}
                    <strong className="text-primary-7">{email ?? "email của bạn"}</strong>. Vui lòng kiểm tra hộp thư
                    và nhập mã để xác minh. Mã có hiệu lực trong <strong>10 phút</strong>.
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

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

