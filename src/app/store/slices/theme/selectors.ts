import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../index";

export const themeRootSelector = (state: RootState) => state.theme;

export const themeSelector = createSelector(themeRootSelector, (theme) => theme);
