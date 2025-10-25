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
