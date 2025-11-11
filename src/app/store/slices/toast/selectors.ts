import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import type { ToastState } from "./types";

const toastSelector = (state: RootState): ToastState => state.toast;

export const selectToastMessages = createSelector([toastSelector], (state) => state.messages);

export const selectToastCount = createSelector([toastSelector], (state) => state.messages.length);
