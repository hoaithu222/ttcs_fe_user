import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as Form from "@radix-ui/react-form";
import Modal from "@/foundation/components/modal/Modal";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import Input from "@/foundation/components/input/Input";
import PinInput from "@/widgets/otp-modal/PinInput";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { setupSmartOtpStart } from "@/app/store/slices/setting/setting.slice";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import { userOtpApi } from "@/core/api/auth";

interface SetupSmartOtpForSettingProps {
  onSuccess: () => void;
}

interface FormData {
  password: string;
  confirmPassword: string;
  otp: string;
}

const SetupSmartOtpForSetting = ({ onSuccess }: SetupSmartOtpForSettingProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
      otp: "",
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const otp = watch("otp");

  useEffect(() => {
    if (user?.email && !otpSent) {
      userOtpApi
        .request({
          identifier: user.email,
          channel: "email",
          purpose: "setup_smart_otp",
        })
        .then(() => {
          setOtpSent(true);
        })
        .catch(() => {
          // Silent fail
        });
    }
  }, [user?.email, otpSent]);

  const handleResendOtp = () => {
    if (!user?.email) return;
    setResending(true);
    userOtpApi
      .request({
        identifier: user.email,
        channel: "email",
        purpose: "setup_smart_otp",
      })
      .then(() => {
        setOtpSent(true);
        setResending(false);
      })
      .catch(() => {
        setResending(false);
      });
  };

  const onSubmit = (data: FormData) => {
    dispatch(
      setupSmartOtpStart({
        password: data.password,
        otp: data.otp,
      })
    );
    onSuccess();
  };

  const isDisabled = !password || !confirmPassword || password !== confirmPassword || !otp || otp.length < 6;

  return (
    <div className="flex flex-col gap-4 p-6 overflow-y-auto">
      <AlertMessage
        type="info"
        title="Thông tin quan trọng"
        message="Mật khẩu Smart OTP sẽ được sử dụng để xác minh khi đăng nhập. Vui lòng lưu mật khẩu này ở nơi an toàn."
      />

      <Form.Root onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-3">
          <Controller
            name="password"
            control={control}
            rules={{
              required: "Mật khẩu là bắt buộc",
              minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            }}
            render={({ field }) => (
              <Input
                {...field}
                name="password"
                type={showPassword ? "text" : "password"}
                label="Mật khẩu Smart OTP"
                placeholder="Nhập mật khẩu Smart OTP"
                error={errors.password?.message}
                required
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-6 hover:text-neutral-9"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "Xác nhận mật khẩu là bắt buộc",
              validate: (value) =>
                value === password || "Mật khẩu xác nhận không khớp",
            }}
            render={({ field }) => (
              <Input
                {...field}
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu Smart OTP"
                error={errors.confirmPassword?.message}
                required
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-neutral-6 hover:text-neutral-9"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
            )}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-9 mb-2">
              Mã OTP xác minh <span className="text-error">*</span>
            </label>
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
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-neutral-6">
                Mã OTP đã được gửi đến {user?.email}
              </span>
              <button
                type="button"
                className="font-semibold text-primary-6 hover:text-primary-7"
                onClick={handleResendOtp}
                disabled={resending}
              >
                {resending ? "Đang gửi..." : "Gửi lại OTP"}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              className="flex-1 px-4 py-2 text-sm font-medium text-neutral-9 bg-neutral-2 rounded-lg hover:bg-neutral-3 transition-colors"
              onClick={onSuccess}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isDisabled}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-7 rounded-lg hover:bg-primary-8 disabled:bg-neutral-4 disabled:text-neutral-6 disabled:cursor-not-allowed transition-colors"
            >
              Thiết lập
            </button>
          </div>
        </div>
      </Form.Root>
    </div>
  );
};

export default SetupSmartOtpForSetting;

