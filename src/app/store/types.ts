// Store types
export interface RootState {
  language: {
    current: string;
    available: string[];
  };
  theme: {
    mode: "light" | "dark";
    colors: Record<string, string>;
  };
  toast: {
    messages: Array<{
      id: string;
      type: "success" | "error" | "warning" | "info";
      message: string;
      duration?: number;
    }>;
  };
  auth: any; // Will be properly typed when auth slice is imported
}

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
} as const;

export type AppReducerTypeKeys = keyof typeof AppReducerType;
