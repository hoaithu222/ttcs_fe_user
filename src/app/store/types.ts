// Store types
// RootState is now exported from index.ts
// Keeping this file for other types

export enum ReduxStateType {
  INIT = "INIT",
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

// Define AppReducerType as a const object for use as values
export const AppReducerType = {
  LANGUAGE: "language",
  THEME: "theme",
  TOAST: "toast",
  AUTH: "auth",
  SETTING: "setting",
} as const;

export type AppReducerTypeKeys = keyof typeof AppReducerType;
