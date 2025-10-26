import { combineReducers } from "@reduxjs/toolkit";
import languageReducer from "./slices/language";
import themeReducer from "./slices/theme";
import authReducer from "@/features/Auth/components/slice/auth.slice";
import { toastReducer } from "./slices/toast";
import { AppReducerType } from "./types";

export const rootReducer = combineReducers({
  [AppReducerType.LANGUAGE]: languageReducer,
  [AppReducerType.THEME]: themeReducer,
  [AppReducerType.AUTH]: authReducer,
  [AppReducerType.TOAST]: toastReducer,
});
