import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import MainLayout from "@/layout/MainLayout";
import { ROUTE } from "./routers.config";
import React from "react";
import { authMiddleware } from "./auth.middleware";
import AppShell from "@/AppShell";
import { LoaderFunction } from "react-router-dom";
import LoginLayout from "@/layout/LoginLayout";
import NotFound from "@/layout/NotFound";
import NotPermisstion from "@/layout/NotPermisstion";

// map layout name thành component layout tương ứng
const layoutMap = {
  main: MainLayout,
  auth: LoginLayout,
  notFound: NotFound,
  notPermisstion: NotPermisstion,
};

// gom các router theo layout trở thành nhánh trong router tree
const layoutRoutes: Record<string, RouteObject> = {};

/**
 * Duyệt qua từng router trong routers.config.tsx
 * Tạo nhánh trong router tree dựa trên layout của router
 * gắn authMiddleware vào router tương ứng
 */
Object.values(ROUTE).forEach((router) => {
  const { layout, path, element, options } = router;

  // nếu layout chưa được tạo, thì khởi tạo router cha cho router đó
  if (!layoutRoutes[layout]) {
    layoutRoutes[layout] = {
      element: React.createElement(layoutMap[layout as keyof typeof layoutMap]),
      children: [],
    };
  }

  // thêm router vào nhánh tương ứng
  layoutRoutes[layout].children?.push({
    path: path.replace(/^\//, ""),
    element,
    loader: authMiddleware({ requireAuth: options.requireAuth }) as unknown as LoaderFunction,
  });
});

// Thêm 404 route chỉ một lần cho mỗi layout
Object.keys(layoutRoutes).forEach((layout) => {
  layoutRoutes[layout].children?.push({
    path: "*",
    element: <Navigate to="/not-found" replace />,
  });
});

/**
 * Gộp tất cả router lại dưới appshell
 * appshell được render 1 lần duy nhất
 * mỗi layout con sẽ nằm trong <Outlet /> của appshell
 */
const routers: RouteObject = {
  path: "/",
  element: <AppShell />,
  children: Object.values(layoutRoutes),
};

export const router = createBrowserRouter([routers]);
