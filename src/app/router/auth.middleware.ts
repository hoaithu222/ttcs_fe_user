import { LoaderFunctionArgs, redirect } from "react-router-dom";

export const authMiddleware = (options: { requireAuth: boolean }) => {
  return async ({ request }: LoaderFunctionArgs) => {
    const pathname = new URL(request.url).pathname;
    const isLoginPage = pathname.includes("/login");

    try {
      // Lấy dữ liệu từ localStorage
      const authData = localStorage.getItem("persist:auth");

      if (!authData) {
        // Nếu không có dữ liệu auth và cần authentication
        if (options.requireAuth && !isLoginPage) {
          return redirect("/login");
        }
        return null;
      }

      // Parse dữ liệu auth
      const parsedAuth = JSON.parse(authData);

      // Kiểm tra isAuthenticated - có thể là string hoặc boolean
      let isAuthenticated = false;

      if (typeof parsedAuth.isAuthenticated === "string") {
        isAuthenticated = parsedAuth.isAuthenticated === "true";
      } else {
        isAuthenticated = Boolean(parsedAuth.isAuthenticated);
      }

      // Nếu cần authentication nhưng chưa đăng nhập và không phải trang login
      if (options.requireAuth && !isAuthenticated && !isLoginPage) {
        return redirect("/login");
      }

      // Nếu đã đăng nhập mà vào trang login thì redirect về home
      if (isAuthenticated && isLoginPage) {
        return redirect("/");
      }

      return null;
    } catch (error) {
      console.error("Auth middleware error:", error);

      // Nếu có lỗi parse và cần authentication
      if (options.requireAuth && !isLoginPage) {
        return redirect("/login");
      }

      return null;
    }
  };
};
