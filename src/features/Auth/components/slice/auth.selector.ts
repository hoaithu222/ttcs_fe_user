import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";
import { IAuthState } from "./auth.types";

const authSelector = (state: RootState) => state.auth as IAuthState;

export const selectIsLogin = createSelector([authSelector], (state) => state.isLogin);

export const selectIsRegister = createSelector([authSelector], (state) => state.isRegister);

export const selectIsLoadingLogin = createSelector([authSelector], (state) => state.isLoadingLogin);

export const selectIsLoadingRegister = createSelector(
  [authSelector],
  (state) => state.isLoadingRegister
);

export const selectRegisterStatus = createSelector([authSelector], (state) => state.registerStatus);

export const selectIsLoadingForgotPassword = createSelector(
  [authSelector],
  (state) => state.isLoadingForgotPassword
);

export const selectIsAuthenticated = createSelector(
  [authSelector],
  (state) => state.isAuthenticated
);

export const selectUser = createSelector([authSelector], (state) => state.user);

export const selectLogoutStatus = createSelector(
  [authSelector],
  (state) => state.logout.logoutStatus
);

export const selectForgotPasswordStatus = createSelector(
  [authSelector],
  (state) => state.forgotPassword.forgotPasswordStatus
);

export const selectForgotPasswordStep = createSelector(
  [authSelector],
  (state) => state.forgotPassword.stepForgotPassword
);

export const selectForgotPasswordEmail = createSelector(
  [authSelector],
  (state) => state.forgotPassword.email
);

export const selectForgotPasswordOtp = createSelector(
  [authSelector],
  (state) => state.forgotPassword.otp
);

export const selectForgotPasswordNewPassword = createSelector(
  [authSelector],
  (state) => state.forgotPassword.newPassword
);

export const selectForgotPasswordConfirmPassword = createSelector(
  [authSelector],
  (state) => state.forgotPassword.confirmPassword
);

export const selectForgotPasswordState = createSelector(
  [authSelector],
  (state) => state.forgotPassword
);

export const selectFirstLoginFlow = createSelector(
  [authSelector],
  (state) => state.firstLoginFlow
);

export const selectVerifyEmailFlow = createSelector(
  [authSelector],
  (state) => state.verifyEmailFlow
);

export const selectLoginStep = createSelector([authSelector], (state) => state.loginStep);

export const selectUserOtp = createSelector([authSelector], (state) => state.userOtp);
