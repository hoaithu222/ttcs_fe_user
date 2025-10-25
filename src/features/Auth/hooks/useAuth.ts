import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  loginUser,
  logoutUser,
  register,
  forgotPassword,
} from "@/features/Auth/components/slice/auth.slice";
import { LoginRequest } from "@/core/api/auth/type";
import { useNavigate } from "react-router-dom";
import { ROUTE } from "@/app/router/routers.config";
import {
  selectIsAuthenticated,
  selectIsLoadingLogin,
  selectIsLoadingRegister,
  selectIsLoadingForgotPassword,
  selectUser,
  selectLogoutStatus,
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
  const isLoadingForgotPassword = useAppSelector(selectIsLoadingForgotPassword);
  const user = useAppSelector(selectUser);
  const logoutStatus = useAppSelector(selectLogoutStatus);

  // Redirect sau khi login thành công
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Redirecting to home after login success");
      navigate(ROUTE.home.path);
    }
  }, [isAuthenticated, user, navigate]);

  // Redirect sau khi logout thành công
  useEffect(() => {
    if (logoutStatus === ReduxStateType.SUCCESS) {
      console.log("Logout successful, redirecting to login");
      navigate(ROUTE.auth.path);
    }
  }, [logoutStatus, navigate]);

  // Kiểm tra token khi component mount
  useEffect(() => {
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
  }, [dispatch]);

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

  return {
    // State
    isAuthenticated,
    isLoadingLogin,
    isLoadingRegister,
    isLoadingForgotPassword,
    user,
    logoutStatus,

    // Actions
    onSubmitLogin,
    onSubmitRegister,
    onSubmitForgotPassword,
    onLogout,
    refreshToken,
  };
};

export default useAuth;
