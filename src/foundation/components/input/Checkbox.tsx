import * as React from "react";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import clsx from "clsx";

import Icon, { IconSize } from "../icons/Icon";

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, "onCheckedChange"> {
  /** Nội dung label hiển thị bên cạnh checkbox */
  label?: React.ReactNode;
  /** Thông báo lỗi (nếu có) */
  error?: string;
  /** Có thể thêm các class tùy chỉnh cho root checkbox */
  className?: string;
  /** Trạng thái disable của checkbox */
  disabled?: boolean;
  /** Trạng thái checked của checkbox (dành cho controlled component) */
  checked?: boolean | "indeterminate";
  /** Giá trị mặc định khi khởi tạo (dành cho uncontrolled component) */
  defaultChecked?: boolean | "indeterminate";
  /** Sự kiện thay đổi trạng thái */
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  /** Kích thước của checkbox */
  size?: IconSize;
  /** ID để sử dụng cho việc testing */
  testId?: string;
  /** Class cho wrapper */
  wrapperClassName?: string;
  /** Class cho label */
  labelClassName?: string;
  /** Vị trí của label */
  labelPosition?: "left" | "right";
  /** Class cho wrapper */
  wrapperContentClassName?: string;
  /* ẩn checkbox */
  hiddenCheckbox?: boolean;
}

/**
 * @component Checkbox
 *
 * ✅ Checkbox có hỗ trợ controlled/uncontrolled, label, lỗi, và icon tùy chỉnh.
 *
 * 🔧 Props chính:
 * @param {React.ReactNode} [label] - Nội dung hiển thị bên cạnh checkbox, có thể click để toggle.
 * @param {boolean | 'indeterminate'} [checked] - Trạng thái checked (controlled).
 * @param {boolean | 'indeterminate'} [defaultChecked] - Trạng thái mặc định (uncontrolled).
 * @param {(checked: boolean | 'indeterminate') => void} [onCheckedChange] - Callback khi thay đổi trạng thái.
 * @param {boolean} [disabled] - Vô hiệu hoá checkbox.
 * @param {string} [error] - Thông báo lỗi hiển thị bên dưới.
 * @param {IconSize} [size] - Kích thước icon (sm, base, lg).
 * @param {string} [testId] - Prefix cho `data-testid` phục vụ test.
 *
 * @returns {JSX.Element} - Checkbox với icon tùy chỉnh, label, và message lỗi nếu có.
 */
const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  (
    {
      label,
      error,
      className,
      wrapperClassName = "",
      disabled,
      checked,
      defaultChecked,
      onCheckedChange,
      size = "base",
      testId,
      labelClassName,
      labelPosition = "right",
      wrapperContentClassName = "",
      hiddenCheckbox = false,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState<boolean | "indeterminate">(
      defaultChecked ?? false
    );
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleCheckedChange = (newChecked: boolean | "indeterminate") => {
      if (onCheckedChange) {
        onCheckedChange(newChecked);
      }
      if (!isControlled) {
        setInternalChecked(newChecked === "indeterminate" ? false : newChecked);
      }
    };

    return (
      <div className={clsx("flex flex-col", wrapperContentClassName)} data-testid={testId}>
        <div
          className={clsx(
            "flex items-center justify-center",
            labelPosition === "left" && "flex-row-reverse",
            wrapperClassName
          )}
        >
          {!hiddenCheckbox ? (
            <CheckboxPrimitive.Root
              ref={ref}
              disabled={disabled}
              checked={isChecked}
              className={clsx(
                "flex items-center justify-center rounded border border-transparent bg-transparent p-0 hover:border-transparent focus:outline-none focus:ring-0",
                className
              )}
              data-testid={`${testId}-input`}
              {...props}
            >
              {isChecked ? (
                <Icon
                  name="CheckedBox"
                  onClick={() => {
                    handleCheckedChange(false);
                  }}
                  size={size}
                  disabled={disabled}
                  testId={`${testId}-checked-icon`}
                  className={clsx("text-primary-5", disabled && "opacity-50")}
                />
              ) : (
                <Icon
                  name="UncheckBox"
                  onClick={() => {
                    handleCheckedChange(true);
                  }}
                  size={size}
                  disabled={disabled}
                  testId={`${testId}-unchecked-icon`}
                  className="text-neutral-6"
                />
              )}
            </CheckboxPrimitive.Root>
          ) : (
            <div className={clsx("flex items-center justify-center p-0", className)}></div>
          )}
          {label && (
            <span
              className={clsx(
                "text-body-13 ml-2 cursor-pointer select-none text-neutral-10",
                labelPosition === "left" && "!ml-0",
                labelClassName
              )}
              onClick={disabled ? undefined : () => handleCheckedChange(!isChecked)}
              data-testid={`${testId}-label`}
            >
              {label}
            </span>
          )}
        </div>
        {error && (
          <span className="mt-1 text-caption-12 text-red-5" data-testid={`${testId}-error`}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
