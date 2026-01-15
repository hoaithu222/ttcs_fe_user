import clsx from "clsx";
import logo from "@/assets/image/logo.png";
import Button from "@/foundation/components/buttons/Button";
import { User, Lock, Sparkles, Home } from "lucide-react";
import FloatingInput from "@/foundation/components/input/FloatingInput";
import { LoginRequest } from "@/core/api/auth/type";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/features/Auth/hooks/useAuth";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import SocialLoginButtons from "./SocialLoginButtons";

const Login = () => {
  const { isLoadingLogin, onSubmitLogin } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleForgotPassword = () => {
    navigate(NAVIGATION_CONFIG.forgotPassword.path);
  };

  const handleRegister = () => {
    navigate(NAVIGATION_CONFIG.register.path);
  };

  const handleGoHome = () => {
    navigate(NAVIGATION_CONFIG.home.path);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      {/* Back to home button */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="md"
          onClick={handleGoHome}
          icon={<Home className="w-5 h-5" />}
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 hover:text-indigo-600 border border-gray-200/50 shadow-sm"
        >
          Trang chủ
        </Button>
      </div>
      {/* Background decorative elements */}
      <div className="overflow-hidden absolute inset-0 pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br rounded-full blur-3xl from-blue-200/30 to-purple-200/30"></div>
        <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-gradient-to-tr rounded-full blur-3xl from-indigo-200/20 to-pink-200/20"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-r rounded-full blur-2xl from-cyan-200/40 to-blue-200/40"></div>
      </div>

      <div
        className={clsx(
          "mx-auto w-full max-w-lg",
          "backdrop-blur-xl bg-white/80",
          "border border-white/20",
          "rounded-3xl shadow-2xl shadow-indigo-500/10",
          "p-4 lg:p-6",
          "overflow-hidden relative",
          "transition-all duration-500 transform hover:shadow-3xl hover:shadow-indigo-500/20"
        )}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br via-transparent pointer-events-none from-white/60 to-indigo-50/30"></div>

        <div className="relative z-10">
          {/* Logo section */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-20 blur"></div>
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
          <div className="mb-2 space-y-4 text-center">
            <h2 className="text-xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 lg:text-4xl">
              Chào mừng trở lại!
            </h2>
            <p className="text-gray-600 text-sm">Đăng nhập để tiếp tục mua sắm</p>

            {/* Decorative line */}
            <div className="flex justify-center items-center mt-6">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
              <div className="mx-4 w-2 h-2 bg-indigo-400 rounded-full"></div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
            </div>
          </div>

          {/* Form */}
          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitLogin(data);
            }}
          >
            <div className="space-y-4">
              <div className="relative group">
                <FloatingInput
                  label="Email"
                  fullWidth
                  iconRight={
                    <User className="w-5 h-5 text-indigo-500 transition-colors group-focus-within:text-indigo-600" />
                  }
                  className="rounded-xl border-gray-200 backdrop-blur transition-all duration-300 bg-white/70 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  name="email"
                  type="email"
                  value={data.email}
                  onChange={handleChange}
                />
              </div>

              <div className="relative group">
                <FloatingInput
                  label="Mật khẩu"
                  showPasswordToggle
                  fullWidth
                  iconRight={
                    <Lock className="w-5 h-5 text-indigo-500 transition-colors group-focus-within:text-indigo-600" />
                  }
                  className="rounded-xl border-gray-200 backdrop-blur transition-all duration-300 bg-white/70 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Enhanced submit button */}
            <div >
              <Button
                variant="primary"
                size="lg"
                disabled={isLoadingLogin || !data.email || !data.password}
                type="submit"
                className={clsx(
                  "w-full py-4 px-8 rounded-xl font-semibold text-lg",
                  "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
                  "text-white shadow-lg shadow-indigo-500/25",
                  "transform transition-all duration-300",
                  "hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30",
                  "focus:outline-none focus:ring-4 focus:ring-indigo-500/50",
                  "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none",
                  "relative overflow-hidden group"
                )}
              >
                <span className="flex relative z-10 gap-2 justify-center items-center">
                  {isLoadingLogin ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 animate-spin border-white/30 border-t-white"></div>
                      Đang đăng nhập...
                    </>
                  ) : (
                    <>
                      Đăng nhập
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

          {/* Social Login Buttons */}
          {/* <SocialLoginButtons /> */}

          {/* Register link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={handleRegister}
                className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
