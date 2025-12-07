import clsx from "clsx";
import logo from "@/assets/image/logo.png";
import Button from "@/foundation/components/buttons/Button";
import { Mail, Sparkles, ArrowLeft, Send, Shield, Home } from "lucide-react";
import FloatingInput from "@/foundation/components/input/FloatingInput";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/features/Auth/hooks/useAuth";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import VerifyEmailOtpModal from "@/features/Auth/components/modals/VerifyEmailOtpModal";
import { toastUtils } from "@/shared/utils/toast.utils";
import { authAPI, userOtpApi } from "@/core/api/auth";
import { ReduxStateType } from "@/app/store/types";

const ForgotPassword = () => {
  const {
    isLoadingForgotPassword,
    forgotPasswordStep,
    forgotPasswordStatus,
    forgotPasswordEmail,
    forgotPasswordOtp,
    forgotPasswordNewPassword,
    forgotPasswordConfirmPassword,
    onSubmitForgotPassword,
    setForgotPasswordStep,
    setForgotPasswordOtp,
    setForgotPasswordNewPassword,
    setForgotPasswordConfirmPassword,
    resetForgotPassword,
  } = useAuth();
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState("");
  const [completed, setCompleted] = useState(false);
  const [completedEmail, setCompletedEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    return () => {
      resetForgotPassword();
    };
  }, [resetForgotPassword]);

  useEffect(() => {
    if (forgotPasswordEmail) {
      setEmailInput(forgotPasswordEmail);
    }
  }, [forgotPasswordEmail]);

  useEffect(() => {
    if (forgotPasswordStatus === ReduxStateType.SUCCESS) {
      toastUtils.info("Đã gửi mã OTP đến email của bạn.");
    }
  }, [forgotPasswordStatus]);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      toastUtils.error("Vui lòng nhập email");
      return;
    }
    const result = await onSubmitForgotPassword(emailInput);
    if (!result.success) {
      toastUtils.error("Không thể gửi email đặt lại mật khẩu");
    }
  };

  const handleOtpContinue = (otp: string) => {
    if (!forgotPasswordEmail) {
      toastUtils.error("Vui lòng nhập email trước");
      return;
    }
    if (!otp || otp.length < 6) {
      toastUtils.error("OTP phải có 6 ký tự");
      return;
    }
    setForgotPasswordOtp(otp);
    setForgotPasswordStep("resetPassword");
    toastUtils.success("Vui lòng nhập mật khẩu mới.");
  };

  const handleResendOtp = async () => {
    if (!forgotPasswordEmail) {
      toastUtils.error("Vui lòng nhập email trước");
      return;
    }
    setResendLoading(true);
    try {
      const response = await userOtpApi.request({
        identifier: forgotPasswordEmail,
        channel: "email",
        purpose: "forgot_password",
      });
      if (response.success) {
        toastUtils.success("Đã gửi lại mã OTP");
      } else {
        throw new Error(response.message || "Không thể gửi lại OTP");
      }
    } catch (error: any) {
      toastUtils.error(error?.response?.data?.message || error.message || "Không thể gửi lại OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail || !forgotPasswordOtp) {
      toastUtils.error("Thiếu thông tin xác thực. Vui lòng thực hiện lại.");
      return;
    }
    if (forgotPasswordNewPassword.length < 6) {
      toastUtils.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (forgotPasswordNewPassword !== forgotPasswordConfirmPassword) {
      toastUtils.error("Mật khẩu xác nhận không khớp");
      return;
    }
    setResetLoading(true);
    try {
      const response = await authAPI.resetPassword({
        identifier: forgotPasswordEmail,
        otp: forgotPasswordOtp,
        password: forgotPasswordNewPassword,
        confirmPassword: forgotPasswordConfirmPassword,
      });
      if (response.success) {
        toastUtils.success(response.message || "Đặt lại mật khẩu thành công");
        setCompleted(true);
        setCompletedEmail(forgotPasswordEmail);
        resetForgotPassword();
      } else {
        throw new Error(response.message || "Không thể đặt lại mật khẩu");
      }
    } catch (error: any) {
      toastUtils.error(error?.response?.data?.message || error.message || "Không thể đặt lại mật khẩu");
    } finally {
      setResetLoading(false);
    }
  };

  const handleOtpModalClose = () => {
    setForgotPasswordStep("email");
    setForgotPasswordOtp("");
  };

  const handleBackToLogin = () => {
    navigate(NAVIGATION_CONFIG.login.path);
  };

  const handleGoHome = () => {
    navigate(NAVIGATION_CONFIG.home.path);
  };

  const showOtpModal = forgotPasswordStep === "otp" && !completed;
  const showResetForm = forgotPasswordStep === "resetPassword" && !completed;

  const renderSuccessState = () => (
    <div className="relative z-10">
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full opacity-20 blur"></div>
          <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
          Đặt lại mật khẩu thành công
        </h2>
        <p className="text-gray-600">
          Bạn có thể dùng mật khẩu mới để đăng nhập tài khoản <strong>{completedEmail || emailInput}</strong>.
        </p>
        <div className="space-y-4 pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={handleBackToLogin}
            className="w-full py-4 px-8 rounded-xl font-semibold text-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white"
          >
            Quay lại đăng nhập
          </Button>
          <button
            type="button"
            onClick={() => {
              setCompleted(false);
              setEmailInput("");
            }}
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Đặt lại tài khoản khác
          </button>
        </div>
      </div>
    </div>
  );

  const renderResetForm = () => (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-neutral-9">Đặt mật khẩu mới</h2>
        <p className="text-gray-600">
          Mã OTP đã xác minh cho địa chỉ <strong>{forgotPasswordEmail}</strong>. Vui lòng tạo mật khẩu mới.
        </p>
      </div>
      <form className="space-y-6" onSubmit={handleResetPassword}>
        <FloatingInput
          label="Mật khẩu mới"
          type="password"
          name="newPassword"
          value={forgotPasswordNewPassword}
          onChange={(e) => setForgotPasswordNewPassword(e.target.value)}
          fullWidth
          className="rounded-xl border-gray-200 bg-white/70"
        />
        <FloatingInput
          label="Xác nhận mật khẩu"
          type="password"
          name="confirmPassword"
          value={forgotPasswordConfirmPassword}
          onChange={(e) => setForgotPasswordConfirmPassword(e.target.value)}
          fullWidth
          className="rounded-xl border-gray-200 bg-white/70"
        />
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            type="submit"
            disabled={resetLoading}
            className="w-full py-4 px-8 rounded-xl font-semibold text-lg bg-gradient-to-r from-orange-600 to-amber-600 text-white"
          >
            {resetLoading ? "Đang cập nhật..." : "Xác nhận mật khẩu mới"}
          </Button>
        </div>
      </form>
      <button
        type="button"
        onClick={() => setForgotPasswordStep("email")}
        className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại nhập email khác
      </button>
    </div>
  );

  const renderEmailForm = () => (
    <form className="space-y-8" onSubmit={handleSubmitEmail}>
      <div className="space-y-6">
        <div className="relative group">
          <FloatingInput
            label="Email"
            fullWidth
            iconRight={
              <Mail className="w-5 h-5 text-orange-500 transition-colors group-focus-within:text-orange-600" />
            }
            className="rounded-xl border-gray-200 backdrop-blur transition-all duration-300 bg-white/70 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            name="email"
            type="email"
            value={emailInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailInput(e.target.value)}
          />
        </div>
      </div>
      <div className="pt-4">
        <Button
          variant="primary"
          size="lg"
          disabled={isLoadingForgotPassword || !emailInput}
          type="submit"
          className={clsx(
            "w-full py-4 px-8 rounded-xl font-semibold text-lg",
            "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700",
            "text-white shadow-lg shadow-orange-500/25",
            "transform transition-all duration-300",
            "hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/30",
            "focus:outline-none focus:ring-4 focus:ring-orange-500/50",
            "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none",
            "relative overflow-hidden group"
          )}
        >
          <span className="flex relative z-10 gap-2 justify-center items-center">
            {isLoadingForgotPassword ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 animate-spin border-white/30 border-t-white"></div>
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Gửi mã OTP
                <div className="transition-transform transform group-hover:translate-x-1">
                  →
                </div>
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 -translate-x-full skew-x-12 group-hover:translate-x-full via-white/10"></div>
        </Button>
      </div>
    </form>
  );

  const content = completed ? renderSuccessState() : showResetForm ? renderResetForm() : renderEmailForm();

  return (
    <>
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative">
        {/* Back to home button */}
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="md"
            onClick={handleGoHome}
            icon={<Home className="w-5 h-5" />}
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 hover:text-orange-600 border border-gray-200/50 shadow-sm"
          >
            Trang chủ
          </Button>
        </div>
        <div className="overflow-hidden absolute inset-0 pointer-events-none">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br rounded-full blur-3xl from-orange-200/30 to-amber-200/30"></div>
          <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-gradient-to-tr rounded-full blur-3xl from-yellow-200/20 to-orange-200/20"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-r rounded-full blur-2xl from-orange-200/40 to-amber-200/40"></div>
        </div>
        <div
          className={clsx(
            "mx-auto w-full max-w-lg",
            "backdrop-blur-xl bg-white/80",
            "border border-white/20",
            "rounded-3xl shadow-2xl shadow-orange-500/10",
            "p-8 lg:p-12",
            "overflow-hidden relative",
            "transition-all duration-500 transform hover:shadow-3xl hover:shadow-orange-500/20"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br via-transparent pointer-events-none from-white/60 to-orange-50/30"></div>
          <div className="relative z-10 space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl opacity-20 blur"></div>
                <img
                  src={logo}
                  alt="logo"
                  className="relative w-20 h-20 rounded-2xl ring-4 shadow-lg lg:w-24 lg:h-24 ring-white/50"
                />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>
            {!completed && !showResetForm && (
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-800 lg:text-4xl">
                  Quên mật khẩu?
                </h2>
                <p className="text-gray-600 text-lg">Nhập email để nhận mã OTP đặt lại mật khẩu.</p>
                <div className="flex justify-center items-center mt-6">
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                  <div className="mx-4 w-2 h-2 bg-orange-400 rounded-full"></div>
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                </div>
              </div>
            )}
            {content}
            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </button>
            </div>
          </div>
        </div>
      </div>

      <VerifyEmailOtpModal
        open={showOtpModal}
        email={forgotPasswordEmail}
        submitting={false}
        resending={resendLoading}
        onClose={handleOtpModalClose}
        onSubmit={handleOtpContinue}
        onResend={handleResendOtp}
        title="Nhập mã OTP"
        description="Mã OTP đã được gửi đến email của bạn để đặt lại mật khẩu."
        infoMessage={
          <>
            Mã OTP 6 số đã được gửi đến{" "}
            <strong className="text-primary-7">{forgotPasswordEmail}</strong>. Vui lòng nhập mã để tiếp tục. Mã
            có hiệu lực trong <strong>10 phút</strong>.
          </>
        }
        confirmText="Tiếp tục"
      />
    </>
  );
};

export default ForgotPassword;
