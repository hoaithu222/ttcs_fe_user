import React from "react";

export interface GroupFormRowOption {
  label: string;
  input: React.ReactNode;
  error?: string; // ✅ thêm hỗ trợ error riêng cho từng input
}

interface GroupFormRowProps {
  items?: GroupFormRowOption[];
  layout?: "horizontal" | "vertical";
  hiddenLabel?: boolean;
}

/**
 * GroupFormRow
 *
 * Layout component dùng để hiển thị nhiều input trên cùng một hàng hoặc theo dạng dọc, hỗ trợ error riêng từng input.
 *
 * Props:
 * - items?: GroupFormRowOption[] — Danh sách các input kèm label và error (mỗi item gồm { label, input, error }).
 * - layout?: 'horizontal' | 'vertical' — Bố cục hiển thị từng nhóm label + input (default: 'vertical').
 * - hiddenLabel?: boolean — Ẩn label, chỉ hiển thị input (default: false).
 *
 * Notes:
 * - Các nhóm input được xếp trên cùng một dòng (`flex-row`), mỗi input chiếm flex đều (`flex-1`).
 * - Bên trong từng nhóm, có thể layout label-input theo hàng ngang (`flex-row`) hoặc dọc (`flex-col`).
 * - Nếu `hiddenLabel=true`, sẽ ẩn label và chỉ hiển thị input.
 * - Nếu item có `error`, sẽ render thông báo lỗi ngay dưới input đó.
 *
 * Example:
 * ```tsx
 * <GroupFormRow
 *   items={[
 *     { label: 'Min', input: <Input name="min" />, error: 'Min must be less than Max' },
 *     { label: 'Max', input: <Input name="max" /> },
 *   ]}
 *   layout="horizontal"
 * />
 * ```
 */
const GroupFormRow: React.FC<GroupFormRowProps> = ({
  items,
  layout = "vertical",
  hiddenLabel = false,
}) => (
  <div className="flex flex-row gap-6">
    {items?.map((item) => (
      <div
        key={item.label}
        className={`flex flex-1 items-start gap-1 ${layout === "horizontal" ? "flex-row items-center justify-between" : "flex-col items-start"}`}
      >
        {!hiddenLabel && (
          <label className="text-body-13 text-start text-neutral-10">{item.label}</label>
        )}
        {item.input}
        {item.error && <p className="text-caption-12 text-red-5">{item.error}</p>}
      </div>
    ))}
  </div>
);

export default GroupFormRow;
