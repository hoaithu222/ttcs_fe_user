import { Outlet } from "react-router-dom";

const LoginLayout = () => {
  return (
    <div className="w-screen h-screen">
      <div className="w-full h-full">
        <Outlet />
      </div>
    </div>
  );
};

export default LoginLayout;
