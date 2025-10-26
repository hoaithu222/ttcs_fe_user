import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsAuthenticated } from "./components/slice/auth.selector";
import { useAppSelector } from "@/app/store";
import { useState, useEffect } from "react";

const AuthPage = () => {
  // Sử dụng selector từ auth slice
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot-password">("login");

  // Xác định auth mode dựa trên URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/register")) {
      setAuthMode("register");
    } else if (path.includes("/forgot-password")) {
      setAuthMode("forgot-password");
    } else {
      setAuthMode("login");
    }
  }, [location.pathname]);

  // Nếu đã đăng nhập thì chuyển hướng đến trang chủ
  console.log("[AuthPage] isAuthenticated:", isAuthenticated);

  if (isAuthenticated) {
    console.log("[AuthPage] Redirecting to home");
    return <Navigate to={NAVIGATION_CONFIG.home.path} />;
  }

  const renderAuthComponent = () => {
    switch (authMode) {
      case "login":
        return <Login />;
      case "register":
        return <Register />;
      case "forgot-password":
        return <ForgotPassword />;
      default:
        return <Login />;
    }
  };

  return <div className="flex flex-col w-screen h-screen">{renderAuthComponent()}</div>;
};

export default AuthPage;
