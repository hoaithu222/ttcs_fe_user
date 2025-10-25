import React from "react";

import clsx from "clsx";

export type ChipVariant =
  | "primary"
  | "secondary"
  | "outlined"
  | "outlinedSecondary"
  | "outlinedPrimary"
  | "outlinedThree";

const CHIP_ROUNDED_MAP = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const CHIP_SIZE_MAP = {
  xs: "h-4",
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
  xl: "h-12",
};

const CHIP_TEXT_SIZE_MAP = {
  xs: "text-caption-11",
  sm: "text-caption-12",
  md: "text-body-13",
  lg: "text-body-14",
  xl: "text-title-16",
};

export interface ChipProps {
  variant?: ChipVariant;
  /** Custom Tailwind color classes sẽ ghi đè variant nếu được truyền */
  colorClass?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  isDisabled?: boolean;
  rounded?: keyof typeof CHIP_ROUNDED_MAP;
  testId?: string;
  size?: keyof typeof CHIP_SIZE_MAP;
  textSize?: keyof typeof CHIP_TEXT_SIZE_MAP;
}

const baseClasses =
  "inline-flex items-center justify-center text-center px-3 py-1 focus:outline-none transition-colors";

const variantClasses: Record<ChipVariant, string> = {
  primary: "border-primary-6 bg-transparent text-primary-6 hover:opacity-90",
  secondary: "bg-button-outlined text-base-white border border-button-outlined",
  outlined:
    "bg-transparent text-neutral-7 border border-button-disable-text hover:text-button-outlined-hover hover:border-button-outlined-hover",
  outlinedPrimary: "border border-primary-5 bg-background-popup text-primary-5 hover:opacity-90",
  outlinedSecondary: "bg-transparent text-neutral-7 border-neutral-3 hover:opacity-90",
  outlinedThree: "border border-neutral-3 bg-background-popup text-neutral-7 hover:opacity-90",
};

/**
 * Chip
 *
 * Button nhỏ gọn dùng để hiển thị nhãn (label) tương tác hoặc trạng thái.
 *
 * Props:
 * - variant?: 'primary' | 'secondary' | 'outlined' | 'outlinedSecondary' — Kiểu giao diện chip (default: 'primary').
 * - colorClass?: string — Tailwind classes tuỳ chỉnh, sẽ ghi đè hoàn toàn variant.
 * - onClick?: () => void — Callback khi click vào chip.
 * - children: React.ReactNode — Nội dung hiển thị trong chip.
 * - className?: string — Class bổ sung cho chip.
 * - isDisabled?: boolean — Khóa chip (không click được, opacity giảm 50%).
 * - rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full' — Kiểu bo góc chip (default: 'md').
 * Notes:
 * - Nếu `colorClass` được truyền → sẽ áp dụng thay cho `variantClasses`.
 * - Nếu `isDisabled` = true → chip sẽ có cursor-not-allowed và không nhận sự kiện click.
 * - `size` và `textSize` sẽ ghi đè `variant` nếu được truyền.
 *
 * Example:
 * ```tsx
 * <Chip colorClass="bg-green-500 text-white">
 *   Success
 * </Chip>
 *
 * <Chip variant="outlined" onClick={() => console.log('Clicked')}>
 *   Status
 * </Chip>
 * ```
 */
export const Chip: React.FC<ChipProps> = ({
  variant = "primary",
  colorClass,
  onClick,
  children,
  className = "",
  isDisabled = false,
  rounded = "md",
  testId,
  size = "md",
  textSize = "md",
}) => {
  const appliedVariant = colorClass ?? variantClasses[variant];
  const disabledClasses = isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer";

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
      className={clsx(
        baseClasses,
        appliedVariant,
        disabledClasses,
        CHIP_ROUNDED_MAP[rounded],
        CHIP_SIZE_MAP[size],
        CHIP_TEXT_SIZE_MAP[textSize],
        className
      )}
      data-testid={testId}
    >
      {children}
    </button>
  );
};

export default Chip;
