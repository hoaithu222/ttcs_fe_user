import { lazy } from "react";

const HomePage = lazy(() => import("@/features/Home/HomePage"));
const LoginPage = lazy(() => import("@/features/Auth/Login"));

const defaultOptions = {
  requireAuth: true,
  hideInMenu: false,
};
const defaultAuthOptions = {
  ...defaultOptions,
  requireAuth: true,
};

export const ROUTE = {
  home: {
    path: "/",
    element: <HomePage />,
    layout: "main",
    options: defaultOptions,
  },
  login: {
    path: "/login",
    element: <LoginPage />,
    layout: "login",
    options: defaultAuthOptions,
  },
} satisfies Record<
  string,
  {
    path: string;
    element: React.ReactNode;
    layout: React.ReactNode;
    options: {
      requireAuth: boolean;
      hideInMenu: boolean;
    };
  }
>;
