// src/foundation/components/icons/IconCircleWrapper.tsx
import React from "react";

import clsx from "clsx";

const SIZE_MAP = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-16",
  xl: "size-20",
} as const;

const COLOR_MAP = {
  base: {
    bg: "bg-neutral-1 dark:bg-neutral-9",
    border: "border-neutral-2 dark:border-neutral-8",
    extra: "after:border-neutral-3 dark:after:border-neutral-7",
  },
  success: {
    bg: "bg-green-50 dark:bg-green-900  ",
    border: "border-green-100 dark:border-green-800",
    extra: "after:border-green-200 dark:after:border-green-700",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-900",
    border: "border-red-100 dark:border-red-800",
    extra: "after:border-red-200 dark:after:border-red-700",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900",
    border: "border-yellow-100 dark:border-yellow-800",
    extra: "after:border-yellow-200 dark:after:border-yellow-700",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-800",
    border: "border-blue-100 dark:border-blue-600",
    extra: "after:border-blue-200 dark:after:border-blue-500",
  },
} as const;

type IconCircleWrapperColor = keyof typeof COLOR_MAP;

interface IconCircleWrapperProps {
  children: React.ReactNode;
  size?: keyof typeof SIZE_MAP;
  color?: IconCircleWrapperColor;
  borderWidth?: string; // ví dụ: 'border-2', 'border-4', ...
  className?: string;
  classNameIcon?: string;
  extraBorder?: boolean;
}

const IconCircleWrapper: React.FC<IconCircleWrapperProps> = ({
  children,
  size = "md",
  color = "info",
  borderWidth = "border-4",
  className,
  classNameIcon,
  extraBorder = false,
}) => {
  const sizeClass = SIZE_MAP[size] ?? size;
  const { bg, border, extra } = COLOR_MAP[color] ?? COLOR_MAP.base;

  // tạo class cho ::after
  const afterBorderWidthClass = extraBorder ? `after:${borderWidth}` : "";
  const afterBorderColorClass = extra;

  return (
    <div
      className={clsx(
        "relative inline-flex items-center justify-center rounded-full",
        bg,
        sizeClass,
        className,
        'after:content-[""]',
        "after:absolute",
        "after:-inset-1",
        "after:rounded-full",
        afterBorderWidthClass,
        afterBorderColorClass
      )}
    >
      <div className={clsx("absolute inset-0 rounded-full", borderWidth, border)} />
      <div className={clsx(classNameIcon)}>{children}</div>
    </div>
  );
};

export default React.memo(IconCircleWrapper);
