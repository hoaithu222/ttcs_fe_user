import { createSelector } from "@reduxjs/toolkit";
import { LanguageState } from "./types";

export const selectLanguage = (state: LanguageState) => state.language;

export const languageSelector = createSelector(selectLanguage, (language) => language);
