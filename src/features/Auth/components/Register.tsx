import clsx from "clsx";
import logo from "@/assets/image/logo.png";
import Button from "@/foundation/components/buttons/Button";
import { User, Lock, Sparkles, Mail, UserPlus, Home } from "lucide-react";
import FloatingInput from "@/foundation/components/input/FloatingInput";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/features/Auth/hooks/useAuth";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import { ReduxStateType } from "@/app/store/types";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectVerifyEmailFlow } from "@/features/Auth/components/slice/auth.selector";
import { resetVerifyEmailFlow } from "@/features/Auth/components/slice/auth.slice";

interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

const Register = () => {
  const { isLoadingRegister, registerStatus, onSubmitRegister, resetRegisterStatus } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const verifyEmailFlow = useAppSelector(selectVerifyEmailFlow);
  const [data, setData] = useState<RegisterRequest>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleLogin = () => {
    navigate(NAVIGATION_CONFIG.login.path);
  };

  const handleGoHome = () => {
    navigate(NAVIGATION_CONFIG.home.path);
  };

  // Khi đăng ký thành công chỉ reset trạng thái, còn OTP modal sẽ tự bật
  useEffect(() => {
    if (registerStatus === ReduxStateType.SUCCESS) {
      resetRegisterStatus();
    }
  }, [registerStatus, resetRegisterStatus]);

  // Sau khi xác minh email thành công (trigger từ register) thì chuyển sang trang login
  useEffect(() => {
    if (verifyEmailFlow.verified && verifyEmailFlow.lastTrigger === "register") {
      navigate(NAVIGATION_CONFIG.login.path, { replace: true });
      dispatch(resetVerifyEmailFlow());
    }
  }, [verifyEmailFlow, navigate, dispatch]);

  const isFormValid =
    data.email &&
    data.password &&
    data.confirmPassword &&
    data.fullName &&
    data.password === data.confirmPassword;

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative">
      {/* Back to home button */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="md"
          onClick={handleGoHome}
          icon={<Home className="w-5 h-5" />}
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 hover:text-green-600 border border-gray-200/50 shadow-sm"
        >
          Trang chủ
        </Button>
      </div>
      {/* Background decorative elements */}
      <div className="overflow-hidden absolute inset-0 pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br rounded-full blur-3xl from-green-200/30 to-emerald-200/30"></div>
        <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-gradient-to-tr rounded-full blur-3xl from-teal-200/20 to-cyan-200/20"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-r rounded-full blur-2xl from-green-200/40 to-emerald-200/40"></div>
      </div>

      <div
        className={clsx(
          "mx-auto w-full max-w-lg",
          "backdrop-blur-xl bg-white/80",
          "border border-white/20",
          "rounded-3xl shadow-2xl shadow-green-500/10",
          "p-8 lg:p-12",
          "overflow-hidden relative",
          "transition-all duration-500 transform hover:shadow-3xl hover:shadow-green-500/20"
        )}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br via-transparent pointer-events-none from-white/60 to-green-50/30"></div>

        <div className="relative z-10">
          {/* Logo section */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl opacity-20 blur"></div>
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
            <h2 className="text-3xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-green-800 lg:text-4xl">
              Tạo tài khoản mới
            </h2>
            <p className="text-lg text-gray-600">Tham gia cùng chúng tôi ngay hôm nay</p>

            {/* Decorative line */}
            <div className="flex justify-center items-center mt-6">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-green-300 to-transparent"></div>
              <div className="mx-4 w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-green-300 to-transparent"></div>
            </div>
          </div>

          {/* Form */}
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitRegister(data);
            }}
          >
            <div className="space-y-5">
              <div className="relative group">
                <FloatingInput
                  label="Họ và tên"
                  fullWidth
                  iconRight={
                    <User className="w-5 h-5 text-green-500 transition-colors group-focus-within:text-green-600" />
                  }
                  className="rounded-xl border-gray-200 backdrop-blur transition-all duration-300 bg-white/70 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                  name="fullName"
                  type="text"
                  value={data.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="relative group">
                <FloatingInput
                  label="Email"
                  fullWidth
                  iconRight={
                    <Mail className="w-5 h-5 text-green-500 transition-colors group-focus-within:text-green-600" />
                  }
                  className="rounded-xl border-gray-200 backdrop-blur transition-all duration-300 bg-white/70 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
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
                    <Lock className="w-5 h-5 text-green-500 transition-colors group-focus-within:text-green-600" />
                  }
                  className="rounded-xl border-gray-200 backdrop-blur transition-all duration-300 bg-white/70 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                />
              </div>

              <div className="relative group">
                <FloatingInput
                  label="Xác nhận mật khẩu"
                  showPasswordToggle
                  fullWidth
                  iconRight={
                    <Lock className="w-5 h-5 text-green-500 transition-colors group-focus-within:text-green-600" />
                  }
                  className="rounded-xl border-gray-200 backdrop-blur transition-all duration-300 bg-white/70 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                  name="confirmPassword"
                  value={data.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {/* Password match validation */}
              {data.confirmPassword && data.password !== data.confirmPassword && (
                <p className="text-sm text-red-500">Mật khẩu không khớp</p>
              )}
            </div>

            {/* Enhanced submit button */}
            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                disabled={isLoadingRegister || !isFormValid}
                type="submit"
                className={clsx(
                  "w-full py-4 px-8 rounded-xl font-semibold text-lg",
                  "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
                  "text-white shadow-lg shadow-green-500/25",
                  "transform transition-all duration-300",
                  "hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/30",
                  "focus:outline-none focus:ring-4 focus:ring-green-500/50",
                  "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none",
                  "relative overflow-hidden group"
                )}
              >
                <span className="flex relative z-10 gap-2 justify-center items-center">
                  {isLoadingRegister ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 animate-spin border-white/30 border-t-white"></div>
                      Đang tạo tài khoản...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Tạo tài khoản
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

          {/* Login link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={handleLogin}
                className="font-semibold text-green-600 transition-colors duration-200 hover:text-green-800"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
