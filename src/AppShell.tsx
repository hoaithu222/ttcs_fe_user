import { Outlet } from "react-router-dom";
import ToastContainer from "./widgets/toast/ToastContainer";

/**
 * Appshell là layout chính của toàn bộ ứng dụng
 * Được render 1 lần duy nhất
 * Chứa các thành phần chung như Appbar,Toast,Modal,Dialog,Tooltip,Popover,
 * Dùng <Outlet /> để render các layout con (main,login,extension)
 * Mục tiêu: tránh render lại khi chuyển trang
 * giữ lại trạng thái của modal toast
 *  Là nơi khởi tạo hook toàn cục
 */
const AppShell = () => {
  // Warning tuyệt đổi không thêm localStorage ở đây
  return (
    <div className="w-screen h-screen">
      {/* Outlet se được render layout tương ứng với router hiện tại (main,login,extension) */}
      <Outlet />
      {/* Các Modal,Toast,Dialog,Tooltip,Popover, sẽ được render ở đây */}
      <ToastContainer />
    </div>
  );
};

export default AppShell;
