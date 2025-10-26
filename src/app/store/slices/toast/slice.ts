import { PayloadAction } from "@reduxjs/toolkit";
import { createResettableSlice } from "../../create-resettabable-slice";
import { AppReducerType } from "../../types";
import { ToastState, ToastMessage, initialState } from "./types";

export const { slice, reducer } = createResettableSlice({
  name: AppReducerType.TOAST,
  initialState,
  reducers: {
    addToast: (
      state: ToastState,
      action: PayloadAction<Omit<ToastMessage, "id"> & { id?: string }>
    ) => {
      const id = action.payload.id || Math.random().toString(36).substr(2, 9);
      const toast: ToastMessage = {
        id,
        type: action.payload.type,
        message: action.payload.message,
        duration: action.payload.duration,
      };
      state.messages.push(toast);
    },
    removeToast: (state: ToastState, action: PayloadAction<string>) => {
      state.messages = state.messages.filter((toast) => toast.id !== action.payload);
    },
    clearAllToasts: (state: ToastState) => {
      state.messages = [];
    },
  },
});

export const { addToast, removeToast, clearAllToasts } = slice.actions;
export default reducer;
