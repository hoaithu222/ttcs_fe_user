import { PayloadAction } from "@reduxjs/toolkit";
import { AppReducerType } from "../../types";
import { Language, LanguageState } from "./types";
import { createResettableSlice } from "../../create-resettabable-slice";

const initialState: LanguageState = {
  language: "vi",
};

const { slice, reducer } = createResettableSlice({
  name: AppReducerType.LANGUAGE,
  initialState,
  reducers: {
    setLanguage: (state: LanguageState, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
  },
  persist: {
    whitelist: ["language"],
  },
});

export const { setLanguage, resetState: resetLanguageState } = slice.actions;
export default reducer;
