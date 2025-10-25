import React, { ReactNode, useState } from "react";

import Icon from "../icons/Icon";

interface SummaryActionProps {
  label: string;
  amount: number | string;
  action: ReactNode;
  description?: React.ReactNode;
}

/**
 * SummaryAction
 *
 * Component hiển thị một mục tổng kết gồm label, amount, và action (ví dụ: nút thao tác).
 *
 * Props:
 * - label: string — Nhãn mô tả cho mục tổng kết (ví dụ: "Total", "Balance").
 * - amount: number | string — Giá trị tổng kết hiển thị nổi bật (ví dụ: "1,000 USD").
 * - action: ReactNode — Phần tử action đi kèm (ví dụ: Button, Link).
 * - description: ReactNode — Mô tả cho mục tổng kết (ví dụ: "Fee", "Tax").
 * Notes:
 * - Giao diện chia hai cột: bên trái là label + amount, bên phải là action.
 * - Styling mặc định: border top (`border-t`), padding vertical (`py-6`), căn giữa hàng (`flex` layout).
 * - `amount` dùng class `text-title-20-bold` để làm nổi bật giá trị.
 *
 * Example:
 * ```tsx
 * <SummaryAction
 *   label="Total Balance"
 *   amount="$1,200"
 *   action={<Button>Withdraw</Button>}
 * />
 * ```
 */
const SummaryAction: React.FC<SummaryActionProps> = ({ label, amount, action, description }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 py-6 border-t border-disabled-1">
      {/* Description */}
      {description && isOpen && <div className="text-caption-12">{description}</div>}
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start flex-1 text-neutral-10">
          <div className="flex gap-1">
            <span className="text-caption-12">{label}</span>
            {description && (
              <Icon
                name={isOpen ? "ArrowUpSolid" : "ArrowDownSolid"}
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
              />
            )}
          </div>
          <span className="text-title-20-bold">{amount}</span>
        </div>
        <div className="flex-1">{action}</div>
      </div>
    </div>
  );
};

export default SummaryAction;
