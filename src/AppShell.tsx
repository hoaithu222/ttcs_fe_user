import clsx from "clsx";
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
    <div
      className={clsx(
        "box-border flex flex-col w-screen min-h-screen text-center rounded-lg bg-background-base"
      )}
    >
      {/* Outlet se được render layout tương ứng với router hiện tại (main,login,extension) */}
      <div className="flex overflow-hidden flex-col flex-1">
        <Outlet />
      </div>
      {/* Các Modal,Toast,Dialog,Tooltip,Popover, sẽ được render ở đây */}
      <ToastContainer />
    </div>
  );
};

export default AppShell;
