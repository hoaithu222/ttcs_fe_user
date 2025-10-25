import * as React from "react";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import clsx from "clsx";

import Icon from "../icons/Icon";

export interface RadioOption {
  label: string | React.ReactNode;
  value: string;
  disabled?: boolean;
  gridColumn?: number;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  options: RadioOption[];
  /** Giá trị được kiểm soát */
  value?: string;
  /** Giá trị mặc định khi không kiểm soát */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** orientation: 'vertical' (mặc định) hoặc 'horizontal' */
  orientation?: "vertical" | "horizontal";
  className?: string;
  testId?: string;
}

/**
 * RadioGroup
 *
 * Component nhóm radio button hỗ trợ controlled/uncontrolled, icon checked/unchecked, và validation error.
 *
 * Props:
 * - name: string — Tên trường form (bắt buộc, liên kết với RadioGroupPrimitive.Root).
 * - label?: string — Label hiển thị phía trên nhóm radio.
 * - description?: string — Nội dung mô tả nhỏ bên dưới nhóm radio.
 * - error?: string — Thông báo lỗi validation (hiển thị dưới radio group).
 * - options: RadioOption[] — Danh sách lựa chọn (label + value + optional disabled).
 * - value?: string — Giá trị được kiểm soát (controlled mode).
 * - defaultValue?: string — Giá trị mặc định khi không controlled.
 * - onValueChange?: (value: string) => void — Hàm callback khi thay đổi lựa chọn.
 * - orientation?: 'vertical' | 'horizontal' — Layout radio theo chiều dọc hoặc ngang (default: 'vertical').
 * - className?: string — Class bổ sung cho radio group container.
 * - gridColumn?: number — Số cột mà radio group sẽ chiếm (default: 1).
 * Notes:
 * - Icon `CheckedRounded` hoặc `UncheckedRounded` tự động hiển thị theo trạng thái chọn.
 * - Nếu option `disabled`, item sẽ mờ đi và không click được.
 * - Controlled nếu truyền `value`, hoặc tự quản lý state nếu chỉ truyền `defaultValue`.
 *
 * Example:
 * ```tsx
 * <RadioGroup
 *   name="gender"
 *   label="Gender"
 *   options={[
 *     { label: 'Male', value: 'male' },
 *     { label: 'Female', value: 'female' },
 *   ]}
 *   value={gender}
 *   onValueChange={setGender}
 * />
 * ```
 */
const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      label,
      description,
      error,
      options,
      value,
      defaultValue,
      onValueChange,
      orientation = "vertical",
      className,
      testId,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue);
    const currentValue = isControlled ? value : internalValue;

    const handleChange = (newValue: string) => {
      if (onValueChange) {
        onValueChange(newValue);
      }
      if (!isControlled) {
        setInternalValue(newValue);
      }
    };

    return (
      <div ref={ref} className={clsx("flex flex-col pl-0 text-neutral-9", className)}>
        {label && <label>{label}</label>}
        <RadioGroupPrimitive.Root
          name={name}
          value={currentValue}
          defaultValue={defaultValue}
          onValueChange={handleChange}
          className={clsx(
            "flex pl-0",
            orientation === "vertical" ? "flex-col gap-3" : "flex-row flex-wrap gap-6",
            options.some((opt) => opt.gridColumn === 2) && "grid grid-cols-2 gap-6"
          )}
          {...props}
          data-testid={testId}
        >
          {options.map((option) => (
            <RadioGroupPrimitive.Item
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={clsx(
                "group flex cursor-pointer items-center gap-2 bg-transparent p-0 hover:border-transparent hover:outline-none hover:ring-0 focus:outline-none",
                option.disabled ? "cursor-not-allowed opacity-50" : "",
                option.gridColumn === 2 && "w-full"
              )}
              style={{ marginLeft: 0, paddingLeft: 0 }}
            >
              <div className={clsx("shrink-0 p-0")}>
                {currentValue === option.value ? (
                  <div className="text-primary-5">
                    <Icon
                      name="CheckedRounded"
                      size="base"
                      className="[&>circle:first-child]:text-primary-5 [&>circle:last-child]:text-background-3"
                    />
                  </div>
                ) : (
                  <Icon name="UncheckedRounded" size="base" />
                )}
              </div>
              <span className="transition-colors duration-100 text-body-13 group-hover:text-primary-5">
                {option.label}
              </span>
            </RadioGroupPrimitive.Item>
          ))}
        </RadioGroupPrimitive.Root>
        {description && <p className="mt-1 text-neutral-7">{description}</p>}
        {error && <p className="mt-1 text-error">{error}</p>}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export default RadioGroup;
