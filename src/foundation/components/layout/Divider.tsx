import React, { memo } from "react";

import clsx from "clsx";

type Orientation = "horizontal" | "vertical";

type DividerSize = "xs" | "sm" | "md" | "lg" | "xl";
type DividerLength = "full" | "short";

type DividerVariant = "solid" | "dashed" | "dotted";

interface DividerProps {
  orientation?: Orientation;
  text?: string | React.ReactNode;
  className?: string;
  thickness?: DividerSize; // đổi sang định danh rõ ràng
  color?: string; // Tailwind border hoặc bg class
  length?: DividerLength;
  padding?: string;
  testId?: string;
  variant?: DividerVariant;
  classNameText?: string;
  style?: React.CSSProperties;
}

const THICKNESS_CLASS_MAP: Record<Orientation, Record<DividerSize, string>> = {
  horizontal: {
    xs: "h-px",
    sm: "h-0.5",
    md: "h-1",
    lg: "h-[1.5px]",
    xl: "h-[2px]",
  },
  vertical: {
    xs: "w-px",
    sm: "w-0.5",
    md: "w-1",
    lg: "w-[1.5px]",
    xl: "w-[2px]",
  },
};

const LENGTH_CLASS_MAP: Record<Orientation, Record<DividerLength, string>> = {
  horizontal: {
    full: "w-full",
    short: "w-16",
  },
  vertical: {
    full: "h-full",
    short: "h-16",
  },
};

/**
 * @component Divider
 *
 * 👉 Divider chuẩn hóa dùng để ngăn cách nội dung trong layout hoặc form.
 *
 * - Hỗ trợ cả 2 chiều `horizontal` và `vertical`.
 * - Tùy chỉnh độ dày (`thickness`) theo các mức định danh từ `xs → xl`.
 * - Tùy chỉnh độ dài (`length`) theo kiểu `full` hoặc `short`, ứng dụng cho cả 2 chiều.
 * - Có thể thêm văn bản chính giữa Divider khi truyền `text`.
 * - Hỗ trợ màu sắc tự chọn (`color`) dựa trên class Tailwind `bg-*` hoặc `border-*`.
 * - Cho phép thêm `padding` bên ngoài Divider nếu cần.
 * - Hỗ trợ `data-testid` để kiểm thử.
 *
 * @example
 * ```tsx
 * <Divider orientation="horizontal" thickness="sm" length="short" />
 *
 * <Divider
 *   orientation="horizontal"
 *   text="OR"
 *   color="border-primary-6"
 *   padding="py-4"
 * />
 * ```
 *
 * @props
 * - `orientation?: 'horizontal' | 'vertical'` — Hướng của Divider (mặc định là 'horizontal').
 * - `text?: string | React.ReactNode` — Văn bản chính giữa Divider (nếu có).
 * - `thickness?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` — Độ dày của Divider (theo chiều tương ứng).
 * - `length?: 'full' | 'short'` — Độ dài Divider theo hướng tương ứng.
 * - `color?: string` — Lớp màu Tailwind để tô màu (ví dụ: 'bg-neutral-3', 'border-primary-6').
 * - `padding?: string` — Padding ngoài Divider (ví dụ: 'py-2').
 * - `className?: string` — Custom class cho Divider ngoài class mặc định.
 * - `testId?: string` — Gán giá trị `data-testid` phục vụ kiểm thử.
 * - `variant?: 'solid' | 'dashed' | 'dotted'` — Variant của Divider (mặc định là 'solid').
 * - `classNameText?: string` — Custom class cho text trong Divider.
 *
 * @accessibility
 * - Gắn đúng `role="separator"` và `aria-orientation` để hỗ trợ a11y khi không có text.
 */
const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  text,
  className,
  thickness = "xs",
  color,
  length = "full",
  padding,
  testId,
  variant = "solid", // default
  classNameText,
  style,
}) => {
  const thicknessClass = THICKNESS_CLASS_MAP[orientation][thickness];
  const lengthClass = LENGTH_CLASS_MAP[orientation][length];
  const bgClass = color ?? "bg-neutral-3";
  const borderClass = color ?? "border-neutral-3";

  if (text) {
    return (
      <div
        style={style}
        className={clsx("flex items-center text-neutral-9", padding)}
        data-testid={testId}
      >
        <div className={clsx("grow border-t", borderClass)} />
        <span className={clsx("text-caption-10 mx-3 whitespace-nowrap", classNameText)}>
          {text}
        </span>
        <div className={clsx("grow border-t", borderClass)} />
      </div>
    );
  }

  // dashed/dotted custom style
  const variantClass =
    variant === "dashed"
      ? "divider-dashed"
      : variant === "dotted"
        ? "border-b border-dotted border-neutral-3"
        : "";

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      data-testid={testId}
      className={clsx(
        "shrink-0",
        variant === "solid" ? bgClass : "",
        thicknessClass,
        lengthClass,
        padding,
        variantClass,
        className
      )}
    />
  );
};

export default memo(Divider);
