import clsx from "clsx";
import logo from "@/assets/image/logo.png";
import Button from "@/foundation/components/buttons/Button";
import { Mail, Sparkles, ArrowLeft, Send } from "lucide-react";
import FloatingInput from "@/foundation/components/input/FloatingInput";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/features/Auth/hooks/useAuth";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";

const ForgotPassword = () => {
  const { isLoadingForgotPassword, onSubmitForgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onSubmitForgotPassword(email);
    if (result.success) {
      setIsEmailSent(true);
    }
  };

  const handleBackToLogin = () => {
    navigate(NAVIGATION_CONFIG.login.path);
  };

  if (isEmailSent) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="overflow-hidden absolute inset-0 pointer-events-none">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br rounded-full blur-3xl from-orange-200/30 to-amber-200/30"></div>
          <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-gradient-to-tr rounded-full blur-3xl from-yellow-200/20 to-orange-200/20"></div>
        </div>

        <div
          className={clsx(
            "mx-auto w-full max-w-lg",
            "backdrop-blur-xl bg-white/80",
            "border border-white/20",
            "rounded-3xl shadow-2xl shadow-orange-500/10",
            "p-8 lg:p-12",
            "overflow-hidden relative",
            "text-center"
          )}
        >
          <div className="relative z-10">
            {/* Success icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full opacity-20 blur"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Send className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-4">
              Email đã được gửi!
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong>{email}</strong>
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
            </p>

            <div className="space-y-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleBackToLogin}
                className={clsx(
                  "w-full py-4 px-8 rounded-xl font-semibold text-lg",
                  "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
                  "text-white shadow-lg shadow-green-500/25",
                  "transform transition-all duration-300",
                  "hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/30"
                )}
              >
                Quay lại đăng nhập
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail("");
                }}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Gửi lại email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Background decorative elements */}
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
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br via-transparent pointer-events-none from-white/60 to-orange-50/30"></div>

        <div className="relative z-10">
          {/* Logo section */}
          <div className="flex justify-center mb-8">
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

          {/* Header section */}
          <div className="mb-10 space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-800 lg:text-4xl">
              Quên mật khẩu?
            </h2>
            <p className="text-gray-600 text-lg">
              Đừng lo lắng! Chúng tôi sẽ gửi liên kết đặt lại mật khẩu cho bạn
            </p>

            {/* Decorative line */}
            <div className="flex justify-center items-center mt-6">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
              <div className="mx-4 w-2 h-2 bg-orange-400 rounded-full"></div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-8" onSubmit={handleSubmit}>
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
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Enhanced submit button */}
            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                disabled={isLoadingForgotPassword || !email}
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
                      Gửi liên kết đặt lại
                      <div className="transition-transform transform group-hover:translate-x-1">
                        →
                      </div>
                    </>
                  )}
                </span>
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 -translate-x-full skew-x-12 group-hover:translate-x-full via-white/10"></div>
              </Button>
            </div>
          </form>

          {/* Back to login link */}
          <div className="mt-8 text-center">
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
  );
};

export default ForgotPassword;
