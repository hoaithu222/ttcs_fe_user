import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAppSelector } from "@/app/store";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import { userAuthApi, userOtpApi } from "@/core/api/auth";
import Input from "@/foundation/components/input/Input";
import Button from "@/foundation/components/buttons/Button";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import VerifyEmailOtpModal from "@/features/Auth/components/modals/VerifyEmailOtpModal";
import { Lock, Eye, EyeOff } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import { toastUtils } from "@/shared/utils/toast.utils";

interface ChangePasswordProps {
  push?: (screen: any) => void;
  reset?: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = () => {
  const user = useAppSelector(selectUser);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resending, setResending] = useState(false);
  const [formData, setFormData] = useState<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset: resetForm,
    formState: { errors },
  } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  // Auto send OTP when modal opens
  useEffect(() => {
    if (showOtpModal && user?.email && !otpSent) {
      userOtpApi
        .request({
          identifier: user.email,
          channel: "email",
          purpose: "change_password",
        })
        .then(() => {
          setOtpSent(true);
        })
        .catch(() => {
          // Silent fail
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
        purpose: "change_password",
      })
      .then(() => {
        setOtpSent(true);
        setResending(false);
        toastUtils.success("Đã gửi lại mã OTP");
      })
      .catch(() => {
        setResending(false);
        toastUtils.error("Không thể gửi lại mã OTP");
      });
  };

  const onSubmit = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (data.newPassword !== data.confirmPassword) {
      toastUtils.error("Mật khẩu xác nhận không khớp");
      return;
    }

    // Save form data and show OTP modal
    setFormData({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
    setShowOtpModal(true);
    setOtpSent(false);
  };

  const handleOtpSubmit = async (otpCode: string) => {
    if (!formData) return;

    setLoading(true);
    try {
      console.log("[Change Password] Submitting with OTP:", otpCode);
      const response = await userAuthApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
        otp: otpCode,
        otpPurpose: "change_password",
      });

      console.log("[Change Password] Response:", response);
      if (response && response.success) {
        toastUtils.success("Đổi mật khẩu thành công");
        resetForm();
        setShowOtpModal(false);
        setOtpSent(false);
        setFormData(null);
      } else {
        const errorMessage = response?.message || "Không thể đổi mật khẩu";
        console.error("[Change Password] Failed:", errorMessage, response);
        toastUtils.error(errorMessage);
      }
    } catch (error: any) {
      console.error("[Change Password] Error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể đổi mật khẩu";
      toastUtils.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    !watch("currentPassword") ||
    !newPassword ||
    !confirmPassword ||
    newPassword !== confirmPassword ||
    newPassword.length < 6 ||
    loading;

  return (
    <>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <IconCircleWrapper size="md" color="info">
          <Lock className="text-primary-7 dark:text-white" />
        </IconCircleWrapper>
        <div>
          <h2 className="text-2xl font-bold text-neutral-9">Đổi mật khẩu</h2>
          <p className="text-sm text-neutral-6 mt-0.5">
            Thay đổi mật khẩu đăng nhập của bạn
          </p>
        </div>
      </div>

      <AlertMessage
        type="info"
        title="Lưu ý"
        message="Mật khẩu mới phải có ít nhất 6 ký tự. Vui lòng chọn mật khẩu mạnh để bảo vệ tài khoản của bạn."
      />

      <Form.Root onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="currentPassword"
          control={control}
          rules={{
            required: "Mật khẩu hiện tại là bắt buộc",
          }}
          render={({ field }) => (
            <Input
              {...field}
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              error={errors.currentPassword?.message}
              required
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-neutral-6 hover:text-neutral-9"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
            />
          )}
        />

        <Controller
          name="newPassword"
          control={control}
          rules={{
            required: "Mật khẩu mới là bắt buộc",
            minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
          }}
          render={({ field }) => (
            <Input
              {...field}
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              error={errors.newPassword?.message}
              required
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-neutral-6 hover:text-neutral-9"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
              value === newPassword || "Mật khẩu xác nhận không khớp",
          }}
          render={({ field }) => (
            <Input
              {...field}
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu mới"
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

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outlined"
            onClick={() => resetForm()}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="submit" variant="primary" disabled={isDisabled || loading}>
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </Button>
        </div>
      </Form.Root>
      </div>

      <VerifyEmailOtpModal
        open={showOtpModal}
        email={user?.email}
        submitting={loading}
        resending={resending}
        onClose={() => {
          setShowOtpModal(false);
          setOtpSent(false);
          setFormData(null);
        }}
        onSubmit={handleOtpSubmit}
        onResend={handleResendOtp}
        title="Xác nhận đổi mật khẩu"
        description="Nhập mã OTP được gửi đến email của bạn để xác nhận yêu cầu đổi mật khẩu."
        infoMessage={
          <>
            Mã OTP 6 số đã được gửi đến{" "}
            <strong className="text-primary-7">{user?.email ?? "email của bạn"}</strong>. Vui lòng nhập mã để
            xác nhận đổi mật khẩu. Mã có hiệu lực trong <strong>10 phút</strong>.
          </>
        }
        confirmText="Xác nhận đổi mật khẩu"
      />
    </>
  );
};

export default ChangePassword;

