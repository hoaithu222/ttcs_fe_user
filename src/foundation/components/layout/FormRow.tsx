import React, { Children, isValidElement } from "react";

import clsx from "clsx";

const PADDING_Y_MAP = {
  xs: "py-1",
  sm: "py-2",
  md: "py-3",
  lg: "py-4",
  none: "py-0",
} as const;

interface FormRowProps {
  label?: string | React.ReactNode;
  name?: string; // auto generate id if needed
  required?: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;

  // Customization
  gapClass?: string;
  labelClass?: string;
  errorClass?: string;
  className?: string;
  horizontal?: boolean;
  testId?: string;
  isAction?: React.ReactNode;
  paddingY?: keyof typeof PADDING_Y_MAP;
  wrapperContentClass?: string;
  wrapperLabelClass?: string;
}

/**
 * @component FormRow
 *
 * 📌 Dùng để render một dòng trong form bao gồm:
 *    - Label
 *    - Mô tả (description)
 *    - Field (children)
 *    - Error message
 *
 * 🎯 Tăng tính nhất quán về layout và accessibility khi hiển thị các field nhập liệu.
 *
 * ---
 * ✅ Tính năng:
 * - Tự động liên kết `label`, `description`, `error` với field thông qua các thuộc tính `aria-*` và `htmlFor`.
 * - Nếu `children` là một React element hợp lệ, sẽ tự động thêm các props:
 *   - `id` (theo `name`)
 *   - `aria-describedby` (nếu có lỗi)
 *   - `aria-invalid` (khi có lỗi)
 *   - `className="w-full"` để đảm bảo field luôn chiếm full width
 * - Cho phép tùy biến khoảng cách và style thông qua các prop như `gapClass`, `labelClass`, `errorClass`.
 *
 * ---
 * 🧩 Props:
 * - `label?: string` – Nhãn hiển thị phía trên field.
 * - `name?: string` – Dùng để sinh `id`, `aria-describedby` và liên kết các phần tử lại với nhau.
 * - `required?: boolean` – Nếu `true`, hiển thị dấu * màu đỏ bên cạnh label.
 * - `description?: string` – Nội dung mô tả chi tiết phía dưới label.
 * - `error?: string` – Nội dung thông báo lỗi hiển thị phía dưới field.
 * - `children: React.ReactNode` – Phần tử nhập liệu (input, select, v.v.).
 * - `gapClass?: string` – Class Tailwind cho khoảng cách giữa các phần (default: `'gap-2'`).
 * - `labelClass?: string` – Class Tailwind cho label (default: `'text-body-14 text-neutral-8'`).
 * - `errorClass?: string` – Class Tailwind cho lỗi (default: `'text-caption-12 text-red-6 text-start'`).
 * - `testId?: string` – Gán `data-testid` phục vụ unit test.
 * - `horizontal?: boolean` – Nếu `true`, layout chuyển sang hàng ngang.
 * - `isAction?: React.ReactNode` – Nếu có, sẽ render phần custom action thay cho label/description.
 * - `paddingY?: keyof typeof PADDING_Y_MAP` – Padding dọc (top/bottom) của FormRow.
 *
 * ---
 * ♿ Accessibility:
 * - Gắn `htmlFor`, `aria-describedby`, `aria-invalid` và `id` hợp lý nếu `name` được cung cấp.
 *
 * ---
 * 💡 Ví dụ:
 * ```tsx
 * <FormRow
 *   label="Số tiền chuyển"
 *   name="amount"
 *   description="Vui lòng nhập số tiền chính xác"
 *   error="Số tiền không hợp lệ"
 *   required
 * >
 *   <Input name="amount" placeholder="Nhập số tiền" />
 * </FormRow>
 * ```
 */
const FormRow: React.FC<FormRowProps> = ({
  label,
  name,
  required = false,
  description,
  error,
  children,
  gapClass = "gap-2",
  labelClass = "text-body-14 text-neutral-8",
  errorClass = "text-caption-12 text-red-5 text-start mt-1",
  className = "",
  horizontal = false,
  testId,
  isAction,
  paddingY = "none",
  wrapperContentClass = "",
  wrapperLabelClass = "",
}) => {
  const fieldId = name ? `${name}-input` : undefined;
  const descriptionId = name && description ? `${name}-desc` : undefined;
  const errorId = name && error ? `${name}-error` : undefined;
  const describedByIds = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  const enhancedChildren = Children.map(children, (child) => {
    if (isValidElement(child)) {
      const element = child as React.ReactElement<any>;
      const existingClass = element.props.className ?? "";
      return React.cloneElement(element, {
        id: fieldId,
        "aria-describedby": describedByIds,
        "aria-invalid": !!error,
        className: clsx(existingClass, ""),
      });
    }
    return child;
  });

  // helper render label + description or custom action
  const renderLabelSection = () =>
    isAction ? (
      <>{isAction}</>
    ) : (
      <>
        {label && (
          <label htmlFor={fieldId} className={clsx(labelClass, "text-start")}>
            {label}
            {required && <span className="ml-1 text-red-5">*</span>}
          </label>
        )}
        {description && (
          <p id={descriptionId} className="text-caption-11 text-neutral-6">
            {description}
          </p>
        )}
      </>
    );

  if (horizontal) {
    return (
      <div
        className={clsx(
          // 2 cột tỉ lệ 1fr – 2fr = 1/3 – 2/3
          "grid w-full grid-cols-[1fr_2fr] items-center",
          gapClass,
          PADDING_Y_MAP[paddingY],
          className
        )}
        data-testid={testId}
      >
        {/* Cột 1: label + description */}
        <div className={clsx("flex flex-col space-y-1", wrapperLabelClass)}>
          {renderLabelSection()}
        </div>

        {/* Cột 2: input */}
        <div className={clsx("flex flex-col", wrapperContentClass)}>{enhancedChildren}</div>

        {/* Dòng 2, đặt lỗi ở cột 2 */}
        {error && (
          <p id={errorId} className={clsx(errorClass, "col-start-2 mt-1")}>
            {error}
          </p>
        )}
      </div>
    );
  }

  // vertical (mặc định)
  return (
    <div
      className={clsx("flex flex-col", gapClass, PADDING_Y_MAP[paddingY], className)}
      data-testid={testId}
    >
      {renderLabelSection()}
      {enhancedChildren}
      {error && (
        <p id={errorId} className={clsx(errorClass)}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormRow;
