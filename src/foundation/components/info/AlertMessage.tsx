// foundation/components/AlertMessage.tsx
import React from "react";

import Button from "@/foundation/components/buttons/Button";
import Icon from "@/foundation/components/icons/Icon";
import { useNSTranslate } from "@/shared/hooks";

// Giả sử bạn đã có sẵn component Icon

/**
 * Những loại alert mà component hỗ trợ
 */
export type AlertType = "success" | "error" | "info" | "warning";

export interface AlertMessageProps {
  /** Loại alert, sẽ quyết định màu border, background, icon, text */
  type: AlertType;
  /** Tiêu đề chính (ví dụ: "Chuyển tiền nhanh") */
  title?: string | React.ReactNode;
  /** Nội dung chi tiết (ví dụ: "Giao dịch chuyển tiền và nhận …") */
  message?: string | React.ReactNode;
  /** Callback khi bấm nút “Chi tiết” */
  onDetail?: () => void;
  /** Dùng để test/id nếu muốn */
  testId?: string;
  /** Nút action */
  action?: string | React.ReactNode;
}

/**
 * Trả về class border-color tương ứng với từng loại alert
 */
const getBorderColor = (type: AlertType) => {
  switch (type) {
    case "success":
      return "border-success-toast";
    case "error":
      return "border-error-toast";
    case "info":
      return "border-infomation-toast";
    case "warning":
    default:
      return "border-warning-toast";
  }
};

/**
 * Trả về class background-color tương ứng với từng loại alert
 */
const getBgColor = (type: AlertType) => {
  switch (type) {
    case "success":
      return "bg-bg-success";
    case "error":
      return "bg-bg-error";
    case "info":
      return "bg-bg-information";
    case "warning":
    default:
      return "bg-bg-warning";
  }
};

/**
 * Trả về icon tương ứng (và màu icon) cho từng loại alert
 */
const getIcon = (type: AlertType) => {
  switch (type) {
    case "success":
      return <Icon size="base" name="SuccessFilled" className="text-success-toast" />;
    case "error":
      return <Icon size="base" name="ErrorFilled" className="text-error-toast" />;
    case "info":
      return <Icon size="base" name="InfoFilled" className="text-infomation-toast" />;
    case "warning":
    default:
      return <Icon size="base" name="WarningFilled" className="text-warning-toast" />;
  }
};

/**
 * Trả về class text-color để áp cho phần tiêu đề và nội dung
 * (Ở đây mình chọn “text-{type}-11” làm màu chữ chính,
 *  bạn có thể thay thành text-neutral-{n} nếu muốn chữ trung tính hơn.)
 */
const getTextColor = (type: AlertType) => {
  switch (type) {
    case "success":
      return "text-success-toast";
    case "error":
      return "text-error-toast";
    case "info":
      return "text-infomation-toast";
    case "warning":
    default:
      return "text-warning-toast";
  }
};

/**
 * Foundation component: hiển thị một cái “Alert box” với icon, border, background, tiêu đề, nội dung và nút Chi tiết
 */
const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  title,
  message,
  action,
  onDetail,
  testId,
}) => {
  const t = useNSTranslate();

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-neutral-2 ${getBorderColor(type)} ${getBgColor(type)} `}
      data-testid={testId}
    >
      <div className="flex items-start gap-2 text-start">
        {/* Icon bên trái */}
        {getIcon(type)}

        {/* Phần title + message */}
        <div className="flex-1">
          {title && <div className={`text-body-13-bold ${getTextColor(type)}`}>{title}</div>}
          {message && <div className={`text-body-13 text-base-black`}>{message}</div>}
        </div>
      </div>

      {/* Nút “Chi tiết” ở bên phải */}
      {onDetail && (
        <div className="flex justify-end">
          <Button className="!min-w-0 !px-1" onClick={onDetail} variant="text">
            {t("common.detail")}
          </Button>
        </div>
      )}

      {action && <div className="flex justify-end">{action}</div>}
    </div>
  );
};

export default AlertMessage;
