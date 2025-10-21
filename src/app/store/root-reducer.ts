import { combineReducers } from "@reduxjs/toolkit";
import languageReducer from "./slices/language";
import themeReducer from "./slices/theme";
import { AppReducerType } from "./types";

export const rootReducer = combineReducers({
  [AppReducerType.LANGUAGE]: languageReducer,
  [AppReducerType.THEME]: themeReducer,
});
