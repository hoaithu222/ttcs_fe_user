import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "@/app/store";
import Button from "@/foundation/components/buttons/Button";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import { ShieldCheck, X } from "lucide-react";
import GuideSmartOtp from "@/widgets/otp-modal/GuideSmartOtp";
import PinInput, { PinInputRef } from "@/widgets/otp-modal/PinInput";
import { selectUser, selectIsLoadingLogin } from "@/features/Auth/components/slice/auth.selector";
import { submitPostLoginOtp } from "@/features/Auth/components/slice/auth.slice";
import { toastUtils } from "@/shared/utils/toast.utils";
import Icon from "@/foundation/components/icons/Icon";

interface PostLoginSmartOtpModalProps {
  visible: boolean;
  onClose?: () => void;
}

const PostLoginSmartOtpModal: React.FC<PostLoginSmartOtpModalProps> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isLoadingLogin = useAppSelector(selectIsLoadingLogin);
  const loading = isLoadingLogin;

  const {
    handleSubmit,
    control,
    getValues,
    reset,
    formState: { isValid },
  } = useForm<{ otp: string }>({
    defaultValues: { otp: "" },
  });
  const pinRef = useRef<PinInputRef>(null);

  // Reset form on open
  useEffect(() => {
    if (visible) {
      reset();
    }
  }, [visible, reset]);

  const handleClose = () => {
    // Don't allow closing - user must verify OTP
    toastUtils.warning("Vui lòng nhập mã OTP để hoàn tất đăng nhập.");
  };

  const onVerify = () => {
    const { otp } = getValues();
    if (!otp || otp.length < 6) {
      toastUtils.error("Vui lòng nhập mã OTP 6 số");
      return;
    }

    dispatch(submitPostLoginOtp({ code: otp }));
  };

  return (
    <Dialog.Root open={visible} onOpenChange={(val) => !val && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-overlay fixed inset-0 z-[90] backdrop-blur-sm transition-opacity" />
        <Dialog.Content
          className={clsx(
            "shadow-1 fixed left-1/2 top-1/2 z-[100] max-h-[600px] w-full max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-3 bg-background-dialog text-neutral-9 p-6"
          )}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <Dialog.Title className="text-2xl font-bold text-neutral-9">
              <IconCircleWrapper extraBorder>
                <Icon icon={ShieldCheck} size="base" className="text-primary-7" />
              </IconCircleWrapper>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Icon icon={X} className="text-neutral-6" />
            </Dialog.Close>
          </div>

          <span className="text-2xl font-bold text-neutral-9">Xác thực Smart OTP</span>
          <p className="mb-6 text-sm text-neutral-6">
            Nhập mã OTP 6 số được tạo từ Smart OTP của bạn để hoàn tất đăng nhập
          </p>

          {/* OTP input */}
          <form onSubmit={handleSubmit(onVerify)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-9 mb-2">
                  Mã OTP 6 số <span className="text-error">*</span>
                </label>
                <Controller
                  name="otp"
                  control={control}
                  rules={{
                    required: "OTP là bắt buộc",
                    minLength: { value: 6, message: "OTP phải có 6 ký tự" },
                    maxLength: { value: 6, message: "OTP phải có 6 ký tự" },
                  }}
                  render={({ field }) => (
                    <PinInput
                      {...field}
                      ref={pinRef}
                      disabled={loading}
                      onChange={(val) => {
                        field.onChange(val);
                      }}
                    />
                  )}
                />
              </div>
            </div>

            <div className="mb-6 mt-4">
              <GuideSmartOtp />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 justify-between w-full">
              <Button
                type="button"
                variant="outlined"
                onClick={handleClose}
                fullWidth
                size="lg"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!isValid || loading}
                fullWidth
                size="lg"
              >
                {loading ? "Đang xác minh..." : "Xác nhận"}
              </Button>
            </div>
          </form>

          <VisuallyHidden>
            <Dialog.Description>Post-login Smart OTP modal</Dialog.Description>
          </VisuallyHidden>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PostLoginSmartOtpModal;

