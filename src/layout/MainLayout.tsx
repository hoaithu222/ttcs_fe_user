import { Outlet } from "react-router-dom";
import { lazy } from "react";

const Header = lazy(() => import("@/widgets/header/Index"));
const MainLayout = () => {
  return (
    <div className="w-screen h-screen">
      <Header />
      <div className="w-full h-full">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
