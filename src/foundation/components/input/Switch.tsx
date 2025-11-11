import * as React from "react";

import * as RadixSwitch from "@radix-ui/react-switch";

export interface SwitchProps {
  checked?: boolean;
  value?: boolean; // ✅ cho react-hook-form
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (checked: boolean) => void; // ✅ cho react-hook-form
  disabled?: boolean;
  label?: string;
  className?: string;
  id?: string;
  labelPosition?: "left" | "right";
  name?: string; // cần nếu dùng với Controller
  required?: boolean;
  testId?: string;
  wrapperClassname?: string;
}

/**
 * Switch
 *
 * Toggle switch component hỗ trợ label trái/phải, trạng thái disabled, và Radix accessibility.
 *
 * Props:
 * - checked?: boolean — Trạng thái bật/tắt (controlled).
 * - onCheckedChange?: (checked: boolean) => void — Hàm callback khi trạng thái thay đổi.
 * - disabled?: boolean — Khóa switch, không cho tương tác (default: false).
 * - label?: string — Nội dung label hiển thị bên cạnh switch.
 * - labelPosition?: 'left' | 'right' — Vị trí label (default: 'right').
 * - className?: string — Class bổ sung cho switch container.
 * - id?: string — ID cho switch, tự sinh nếu không truyền.
 * - Các props còn lại kế thừa từ button (React.ComponentPropsWithoutRef<'button'>).
 *
 * Notes:
 * - Controlled nếu truyền `checked` và `onCheckedChange` hoặc `onChange`.
 * - Giao diện nền bật/tắt đổi màu tự động (`bg-primary-6` khi bật, `bg-neutral-4` khi tắt).
 * - Thumb icon dịch chuyển mượt từ trái → phải khi chuyển trạng thái.
 * - Sử dụng Radix Switch để đảm bảo chuẩn accessibility và keyboard navigable.
 *
 * Example:
 * ```tsx
 * <Switch
 *   checked={isActive}
 *   onCheckedChange={setIsActive}
 *   label="Enable Notifications"
 * />
 * ```
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      value,
      onCheckedChange,
      onChange,
      disabled = false,
      label,
      className = "",
      id,
      labelPosition = "right",
      name,
      required,
      testId,
      wrapperClassname,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const switchId = id || generatedId;

    const isChecked = checked ?? value ?? false;

    const handleChange = (nextChecked: boolean) => {
      onCheckedChange?.(nextChecked);
      onChange?.(nextChecked); // react-hook-form cần onChange
    };

    const handleLabelToggle = () => {
      if (!disabled) {
        handleChange(!isChecked);
      }
    };

    return (
      <div
        className={`flex items-center ${disabled ? "cursor-not-allowed opacity-50" : ""} ${wrapperClassname || ""}`}
      >
        {labelPosition === "left" && label && (
          <SwitchLabel
            switchId={switchId}
            label={label}
            required={required}
            className="mr-2"
            disabled={disabled}
            onToggle={handleLabelToggle}
          />
        )}
        <RadixSwitch.Root
          id={switchId}
          ref={ref}
          checked={isChecked}
          onCheckedChange={handleChange}
          disabled={disabled}
          name={name}
          className={`relative h-6 w-10 shrink-0 cursor-pointer rounded-full border-none outline-none ring-0 transition-colors duration-200 ease-in-out data-[state=checked]:bg-primary-6 data-[state=unchecked]:bg-neutral-4 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed ${className}`}
          {...props}
          data-testid={testId}
        >
          <RadixSwitch.Thumb className="absolute left-0.5 top-1/2 z-10 block h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out will-change-transform data-[state=checked]:translate-x-4 data-[disabled]:opacity-50" />
        </RadixSwitch.Root>
        {labelPosition === "right" && label && (
          <SwitchLabel
            switchId={switchId}
            label={label}
            required={required}
            className="ml-2"
            disabled={disabled}
            onToggle={handleLabelToggle}
          />
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

const SwitchLabel: React.FC<{
  switchId: string;
  label: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  onToggle?: () => void;
}> = ({ switchId, label, required, className = "", disabled, onToggle }) => {
  const handleClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (!disabled && onToggle) {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <label
      htmlFor={switchId}
      onClick={handleClick}
      className={`text-body-13 text-neutral-9 cursor-pointer select-none whitespace-nowrap leading-tight ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
    >
      {label}
      {required && <span className="ml-0.5 text-red-5">*</span>}
    </label>
  );
};

SwitchLabel.displayName = "SwitchLabel";

export default Switch;
