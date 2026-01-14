import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  loginUser,
  logoutUser,
  register,
  forgotPassword,
  resetRegisterStatus,
  setForgotPasswordStep,
  setForgotPasswordOtp,
  setForgotPasswordNewPassword,
  setForgotPasswordConfirmPassword,
  resetForgotPassword,
  resetLogoutStatus,
} from "@/features/Auth/components/slice/auth.slice";
import { LoginRequest } from "@/core/api/auth/type";
import { useNavigate } from "react-router-dom";
import { ROUTE } from "@/app/router/routers.config";
import {
  selectIsAuthenticated,
  selectIsLoadingLogin,
  selectIsLoadingRegister,
  selectRegisterStatus,
  selectIsLoadingForgotPassword,
  selectUser,
  selectLogoutStatus,
  selectForgotPasswordStatus,
  selectForgotPasswordStep,
  selectForgotPasswordEmail,
  selectForgotPasswordOtp,
  selectForgotPasswordNewPassword,
  selectForgotPasswordConfirmPassword,
  selectForgotPasswordState,
} from "@/features/Auth/components/slice/auth.selector";
import { tokenUtils } from "@/shared/utils/token.utils";
import { ReduxStateType } from "@/app/store/types";

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoadingLogin = useAppSelector(selectIsLoadingLogin);
  const isLoadingRegister = useAppSelector(selectIsLoadingRegister);
  const registerStatus = useAppSelector(selectRegisterStatus);
  const isLoadingForgotPassword = useAppSelector(selectIsLoadingForgotPassword);
  const user = useAppSelector(selectUser);
  const logoutStatus = useAppSelector(selectLogoutStatus);

  // Forgot password state
  const forgotPasswordStatus = useAppSelector(selectForgotPasswordStatus);
  const forgotPasswordStep = useAppSelector(selectForgotPasswordStep);
  const forgotPasswordEmail = useAppSelector(selectForgotPasswordEmail);
  const forgotPasswordOtp = useAppSelector(selectForgotPasswordOtp);
  const forgotPasswordNewPassword = useAppSelector(selectForgotPasswordNewPassword);
  const forgotPasswordConfirmPassword = useAppSelector(selectForgotPasswordConfirmPassword);
  const forgotPasswordState = useAppSelector(selectForgotPasswordState);

  // Redirect sau khi login thành công (chỉ khi đang ở trang auth)
  useEffect(() => {
    console.log("[useAuth] Check redirect:", { isAuthenticated, user: !!user, userData: user });

    if (isAuthenticated && user) {
      const currentPath = window.location.pathname;
      const authPaths = [ROUTE.auth.path, ROUTE.register.path, ROUTE.forgotPassword.path];

      console.log(
        "[useAuth] Current path:",
        currentPath,
        "Is auth path:",
        authPaths.includes(currentPath)
      );

      // Chỉ redirect khi đang ở trang auth
      if (authPaths.includes(currentPath)) {
        console.log("[useAuth] Redirecting to home after login success");
        navigate(ROUTE.home.path);
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Redirect sau khi logout thành công - luôn về home
  useEffect(() => {
    if (logoutStatus === ReduxStateType.SUCCESS) {
      console.log("Logout successful, redirecting to home");
      navigate(ROUTE.home.path, { replace: true });
      dispatch(resetLogoutStatus());
    }
  }, [logoutStatus, navigate, dispatch]);

  // Kiểm tra token khi component mount
  useEffect(() => {
    // Skip nếu đang authenticate (login success)
    if (isAuthenticated) {
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken && refreshToken) {
      // Kiểm tra access token có hết hạn không
      if (tokenUtils.isTokenExpired(accessToken)) {
        // Access token hết hạn, thử refresh
        if (tokenUtils.isValidToken(refreshToken)) {
          // Refresh token còn hợp lệ, dispatch refresh action
          dispatch({ type: "auth/refreshToken" });
        } else {
          // Refresh token cũng hết hạn, logout
          dispatch(logoutUser());
        }
      } else if (tokenUtils.isTokenExpiringSoon(accessToken)) {
        // Token sắp hết hạn, refresh trước
        dispatch({ type: "auth/refreshToken" });
      }
    }
  }, [dispatch, isAuthenticated]);

  const onSubmitLogin = useCallback(
    async (credentials: LoginRequest) => {
      try {
        dispatch(loginUser(credentials));
        return { success: true };
      } catch (error) {
        return { success: false, error: "Có lỗi xảy ra khi đăng nhập" };
      }
    },
    [dispatch]
  );

  const onSubmitRegister = useCallback(
    async (data: RegisterRequest) => {
      try {
        dispatch(register(data));
        return { success: true };
      } catch (error) {
        return { success: false, error: "Có lỗi xảy ra khi đăng ký" };
      }
    },
    [dispatch]
  );

  const onSubmitForgotPassword = useCallback(
    async (email: string) => {
      try {
        dispatch(forgotPassword(email));
        return { success: true };
      } catch (error) {
        return { success: false, error: "Có lỗi xảy ra khi gửi email đặt lại mật khẩu" };
      }
    },
    [dispatch]
  );

  const onLogout = useCallback(async () => {
    try {
      console.log("Starting logout process");
      dispatch(logoutUser());
      return { success: true };
    } catch (error) {
      return { success: false, error: "Có lỗi xảy ra khi đăng xuất" };
    }
  }, [dispatch]);

  const refreshToken = useCallback(() => {
    dispatch({ type: "auth/refreshToken" });
  }, [dispatch]);

  // Forgot password actions
  const setStep = useCallback(
    (step: "email" | "otp" | "resetPassword") => {
      dispatch(setForgotPasswordStep(step));
    },
    [dispatch]
  );

  const setOtp = useCallback(
    (otp: string) => {
      dispatch(setForgotPasswordOtp(otp));
    },
    [dispatch]
  );

  const setNewPassword = useCallback(
    (password: string) => {
      dispatch(setForgotPasswordNewPassword(password));
    },
    [dispatch]
  );

  const setConfirmPassword = useCallback(
    (password: string) => {
      dispatch(setForgotPasswordConfirmPassword(password));
    },
    [dispatch]
  );

  const onResetForgotPassword = useCallback(() => {
    dispatch(resetForgotPassword());
  }, [dispatch]);

  const onResetRegisterStatus = useCallback(() => {
    dispatch(resetRegisterStatus());
  }, [dispatch]);

  return {
    // State
    isAuthenticated,
    isLoadingLogin,
    isLoadingRegister,
    registerStatus,
    isLoadingForgotPassword,
    user,
    logoutStatus,

    // User status
    userStatus: user?.status,
    isSuspended: user?.status === "suspended",
    isInactive: user?.status === "inactive",

    // Forgot password state
    forgotPasswordStatus,
    forgotPasswordStep,
    forgotPasswordEmail,
    forgotPasswordOtp,
    forgotPasswordNewPassword,
    forgotPasswordConfirmPassword,
    forgotPasswordState,

    // Actions
    onSubmitLogin,
    onSubmitRegister,
    onSubmitForgotPassword,
    onLogout,
    refreshToken,
    resetRegisterStatus: onResetRegisterStatus,

    // Forgot password actions
    setForgotPasswordStep: setStep,
    setForgotPasswordOtp: setOtp,
    setForgotPasswordNewPassword: setNewPassword,
    setForgotPasswordConfirmPassword: setConfirmPassword,
    resetForgotPassword: onResetForgotPassword,
  };
};

export default useAuth;
