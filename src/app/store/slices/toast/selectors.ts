import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../types";

const toastSelector = (state: RootState) => state.toast;

export const selectToastMessages = createSelector([toastSelector], (state) => state.messages);

export const selectToastCount = createSelector([toastSelector], (state) => state.messages.length);
