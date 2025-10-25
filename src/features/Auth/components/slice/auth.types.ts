import { ReduxStateType } from "@/app/store/types";
import { User } from "@/core/api/auth/type";

export interface IAuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLogin: boolean;
  isRegister: boolean;
  isLoadingLogin: boolean;
  isLoadingRegister: boolean;
  isLoadingForgotPassword: boolean;
  logout: {
    logoutStatus: ReduxStateType;
  };
}
