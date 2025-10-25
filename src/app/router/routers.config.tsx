import { lazy } from "react";
import AuthPage from "@/features/Auth/AuthPage";

const HomePage = lazy(() => import("@/features/Home/HomePage"));

const defaultOptions = {
  requireAuth: false,
  hideInMenu: false,
};
const defaultAuthOptions = {
  ...defaultOptions,
  requireAuth: false,
};

export const ROUTE = {
  home: {
    path: "/",
    element: <HomePage />,
    layout: "main",
    options: defaultOptions,
  },
  auth: {
    path: "/login",
    element: <AuthPage />,
    layout: "auth",
    options: defaultAuthOptions,
  },
  register: {
    path: "/register",
    element: <AuthPage />,
    layout: "auth",
    options: defaultAuthOptions,
  },
  forgotPassword: {
    path: "/forgot-password",
    element: <AuthPage />,
    layout: "auth",
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
