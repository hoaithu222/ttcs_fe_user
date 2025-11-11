import React, { useState } from "react";

/**
 * Những loại alert mà component hỗ trợ
 */
export type AlertType = "success" | "error" | "info" | "warning";

export interface AlertMessageProps {
  /** Loại alert, sẽ quyết định màu border, background, icon, text */
  type: AlertType;
  /** Tiêu đề chính */
  title?: string | React.ReactNode;
  /** Nội dung chi tiết */
  message?: string | React.ReactNode;
  /** Callback khi bấm nút "Chi tiết" */
  onDetail?: () => void;
  /** Nút action tùy chỉnh */
  action?: string | React.ReactNode;
  /** Có thể đóng được không */
  dismissible?: boolean;
  /** Callback khi đóng */
  onClose?: () => void;
  /** Icon tùy chỉnh */
  icon?: React.ReactNode;
  /** Hiển thị kiểu compact */
  compact?: boolean;
  /** ClassName tùy chỉnh */
  className?: string;
}

/**
 * Config màu sắc cho từng loại alert sử dụng Tailwind CSS
 */
const ALERT_STYLES = {
  success: {
    border: "border-success",
    bg: "bg-background-2",
    iconBg: "bg-background-1",
    iconColor: "text-success",
    titleColor: "text-success",
    messageColor: "text-neutral-7",
    buttonHover: "hover:bg-background-3",
    gradient: "from-[#2DD08480] via-[#2DD08440] to-transparent",
  },
  error: {
    border: "border-error",
    bg: "bg-background-2",
    iconBg: "bg-background-1",
    iconColor: "text-error",
    titleColor: "text-error",
    messageColor: "text-neutral-7",
    buttonHover: "hover:bg-background-3",
    gradient: "from-[#FF6B6B80] via-[#FF6B6B40] to-transparent",
  },
  info: {
    border: "border-primary-6",
    bg: "bg-background-2",
    iconBg: "bg-background-1",
    iconColor: "text-primary-7",
    titleColor: "text-primary-7",
    messageColor: "text-neutral-7",
    buttonHover: "hover:bg-background-3",
    gradient: "from-[#2E6EBF80] via-[#2E6EBF40] to-transparent",
  },
  warning: {
    border: "border-warning",
    bg: "bg-background-2",
    iconBg: "bg-background-1",
    iconColor: "text-warning",
    titleColor: "text-warning",
    messageColor: "text-neutral-7",
    buttonHover: "hover:bg-background-3",
    gradient: "from-[#FFD93D80] via-[#FFD93D40] to-transparent",
  },
};

/**
 * Icon mặc định cho từng loại alert
 */
const DefaultIcons = {
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

/**
 * AlertMessage Component với Tailwind CSS
 */
const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  title,
  message,
  action,
  onDetail,
  dismissible = false,
  onClose,
  icon,
  compact = false,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const styles = ALERT_STYLES[type];

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className={`rounded-lg p-[1px] bg-gradient-to-r ${styles.gradient} ${className}`}>
      <div
        className={`
          rounded-lg shadow-sm transition-all duration-300
          ${styles.bg}
          ${compact ? "px-3 py-2" : "px-4 py-3"}
        `}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 rounded-full p-1 ${styles.iconBg}`}>
            <div className={styles.iconColor}>{icon || DefaultIcons[type]}</div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <div
                className={`font-semibold ${compact ? "text-sm" : "text-sm"} ${styles.titleColor} mb-1`}
              >
                {title}
              </div>
            )}
            {message && (
              <div className={`${compact ? "text-xs" : "text-sm"} ${styles.messageColor}`}>
                {message}
              </div>
            )}

            {/* Action buttons */}
            {(onDetail || action) && (
              <div className="flex gap-2 mt-3">
                {onDetail && (
                  <button
                    onClick={onDetail}
                    className={`
                    px-3 py-1.5 text-xs font-medium rounded-md
                    transition-colors duration-200
                    ${styles.titleColor} ${styles.buttonHover}
                  `}
                  >
                    Chi tiết
                  </button>
                )}
                {action && <div>{action}</div>}
              </div>
            )}
          </div>

          {/* Close button */}
          {dismissible && (
            <button
              onClick={handleClose}
              className={`
              flex-shrink-0 p-1 rounded-md transition-colors duration-200
              ${styles.iconColor} ${styles.buttonHover}
            `}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// // Demo Component
// const Demo = () => {
//   const [alerts, setAlerts] = useState({
//     success: true,
//     error: true,
//     info: true,
//     warning: true,
//   });

//   const handleDetailClick = (type: string) => {
//     alert(`Xem chi tiết ${type}`);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
//       <div className="max-w-4xl mx-auto space-y-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-800 mb-2">Alert Message Component</h1>
//           <p className="text-gray-600">Component thông báo với Tailwind CSS colors</p>
//         </div>

//         {/* Basic Alerts */}
//         <section className="bg-white rounded-xl shadow-lg p-8">
//           <h2 className="text-2xl font-semibold text-gray-800 mb-6">Alert cơ bản</h2>
//           <div className="space-y-4">
//             <AlertMessage
//               type="success"
//               title="Thành công!"
//               message="Giao dịch của bạn đã được xử lý thành công."
//             />
//             <AlertMessage
//               type="error"
//               title="Có lỗi xảy ra"
//               message="Không thể kết nối đến máy chủ. Vui lòng thử lại sau."
//             />
//             <AlertMessage
//               type="info"
//               title="Thông tin"
//               message="Hệ thống sẽ bảo trì vào 2:00 AM ngày mai."
//             />
//             <AlertMessage
//               type="warning"
//               title="Cảnh báo"
//               message="Mật khẩu của bạn sẽ hết hạn trong 3 ngày."
//             />
//           </div>
//         </section>

//         {/* With Actions */}
//         <section className="bg-white rounded-xl shadow-lg p-8">
//           <h2 className="text-2xl font-semibold text-gray-800 mb-6">Alert với nút action</h2>
//           <div className="space-y-4">
//             <AlertMessage
//               type="success"
//               title="Chuyển tiền nhanh"
//               message="Giao dịch chuyển tiền và nhận tiền ngay lập tức"
//               onDetail={() => handleDetailClick("success")}
//             />
//             <AlertMessage
//               type="error"
//               title="Thanh toán thất bại"
//               message="Không đủ số dư trong tài khoản"
//               onDetail={() => handleDetailClick("error")}
//               action={
//                 <button className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
//                   Nạp tiền
//                 </button>
//               }
//             />
//             <AlertMessage
//               type="info"
//               title="Cập nhật mới"
//               message="Phiên bản 2.0 đã có sẵn"
//               onDetail={() => handleDetailClick("info")}
//             />
//           </div>
//         </section>

//         {/* Dismissible */}
//         <section className="bg-white rounded-xl shadow-lg p-8">
//           <h2 className="text-2xl font-semibold text-gray-800 mb-6">Alert có thể đóng</h2>
//           <div className="space-y-4">
//             {alerts.success && (
//               <AlertMessage
//                 type="success"
//                 title="Email đã được gửi"
//                 message="Vui lòng kiểm tra hộp thư của bạn"
//                 dismissible
//                 onClose={() => setAlerts({ ...alerts, success: false })}
//               />
//             )}
//             {alerts.error && (
//               <AlertMessage
//                 type="error"
//                 title="Lỗi xác thực"
//                 message="Thông tin đăng nhập không chính xác"
//                 dismissible
//                 onClose={() => setAlerts({ ...alerts, error: false })}
//               />
//             )}
//             {alerts.info && (
//               <AlertMessage
//                 type="info"
//                 title="Cookies"
//                 message="Trang web này sử dụng cookies để cải thiện trải nghiệm"
//                 dismissible
//                 onClose={() => setAlerts({ ...alerts, info: false })}
//               />
//             )}
//             {alerts.warning && (
//               <AlertMessage
//                 type="warning"
//                 title="Phiên đăng nhập sắp hết hạn"
//                 message="Vui lòng làm mới trang để tiếp tục"
//                 dismissible
//                 onClose={() => setAlerts({ ...alerts, warning: false })}
//               />
//             )}
//           </div>
//           {!Object.values(alerts).some(Boolean) && (
//             <div className="text-center py-8">
//               <p className="text-gray-500 mb-4">Tất cả alerts đã được đóng</p>
//               <button
//                 onClick={() =>
//                   setAlerts({
//                     success: true,
//                     error: true,
//                     info: true,
//                     warning: true,
//                   })
//                 }
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Reset
//               </button>
//             </div>
//           )}
//         </section>

//         {/* Compact Mode */}
//         <section className="bg-white rounded-xl shadow-lg p-8">
//           <h2 className="text-2xl font-semibold text-gray-800 mb-6">Alert compact</h2>
//           <div className="space-y-3">
//             <AlertMessage type="success" message="Lưu thành công" compact dismissible />
//             <AlertMessage type="error" message="Không thể tải dữ liệu" compact dismissible />
//             <AlertMessage type="info" message="3 thông báo mới" compact dismissible />
//             <AlertMessage type="warning" message="Bạn có thay đổi chưa lưu" compact dismissible />
//           </div>
//         </section>

//         {/* Custom Icons */}
//         <section className="bg-white rounded-xl shadow-lg p-8">
//           <h2 className="text-2xl font-semibold text-gray-800 mb-6">Alert với icon tùy chỉnh</h2>
//           <div className="space-y-4">
//             <AlertMessage
//               type="success"
//               title="Đơn hàng đã được xác nhận"
//               message="Mã đơn hàng: #12345"
//               icon={
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
//                 </svg>
//               }
//             />
//             <AlertMessage
//               type="info"
//               title="Tin nhắn mới"
//               message="Bạn có 5 tin nhắn chưa đọc"
//               icon={
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                   <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                 </svg>
//               }
//             />
//             <AlertMessage
//               type="warning"
//               title="Dung lượng sắp đầy"
//               message="Bạn đã sử dụng 90% dung lượng"
//               icon={
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
//                   <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
//                   <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
//                 </svg>
//               }
//             />
//           </div>
//         </section>

//         {/* Real-world Examples */}
//         <section className="bg-white rounded-xl shadow-lg p-8">
//           <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ví dụ thực tế</h2>
//           <div className="space-y-4">
//             <AlertMessage
//               type="success"
//               title="Đăng ký thành công"
//               message="Chào mừng bạn đến với dịch vụ của chúng tôi! Email xác nhận đã được gửi."
//               action={
//                 <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
//                   Bắt đầu
//                 </button>
//               }
//             />
//             <AlertMessage
//               type="error"
//               title="Không thể tải tệp"
//               message="Tệp vượt quá kích thước cho phép (tối đa 10MB)"
//               onDetail={() => alert("Xem hướng dẫn")}
//             />
//             <AlertMessage
//               type="info"
//               title="Bảo trì định kỳ"
//               message="Hệ thống sẽ tạm ngừng hoạt động từ 2:00 - 4:00 AM để bảo trì"
//               dismissible
//             />
//             <AlertMessage
//               type="warning"
//               title="Xác thực hai yếu tố chưa được kích hoạt"
//               message="Bảo vệ tài khoản của bạn bằng cách bật xác thực hai yếu tố"
//               action={
//                 <button className="px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors">
//                   Kích hoạt ngay
//                 </button>
//               }
//             />
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

export default React.memo(AlertMessage);
