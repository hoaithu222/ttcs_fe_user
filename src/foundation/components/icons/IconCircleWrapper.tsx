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
    bg: "bg-success/10 dark:bg-success/20",
    border: "border-success/30 dark:border-success/40",
    extra: "after:border-success/40 dark:after:border-success/50",
  },
  error: {
    bg: "bg-error/10 dark:bg-error/20",
    border: "border-error/30 dark:border-error/40",
    extra: "after:border-error/40 dark:after:border-error/50",
  },
  warning: {
    bg: "bg-warning/10 dark:bg-warning/20",
    border: "border-warning/30 dark:border-warning/40",
    extra: "after:border-warning/40 dark:after:border-warning/50",
  },
  info: {
    bg: "bg-primary-1 dark:bg-primary-2",
    border: "border-primary-3 dark:border-primary-4",
    extra: "after:border-primary-4 dark:after:border-primary-5",
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
