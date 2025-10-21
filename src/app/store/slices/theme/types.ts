export type Theme = "light" | "dark";

export interface ThemeState {
  theme: Theme;
}

export const initialState: ThemeState = {
  theme: "light",
};
