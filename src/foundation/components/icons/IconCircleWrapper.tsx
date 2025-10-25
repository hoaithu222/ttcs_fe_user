import React, { useState } from "react";
import clsx from "clsx";

const SIZE_MAP = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-16",
  xl: "size-20",
  "2xl": "size-24",
  "3xl": "size-32",
} as const;

const COLOR_MAP = {
  base: {
    bg: "bg-icon-rounded-second",
    border: "border-icon-rounded-first",
    extra: "after:border-icon-rounded-second",
    glow: "shadow-gray-200",
  },
  success: {
    bg: "bg-success-2",
    border: "border-success-1",
    extra: "after:border-success-2",
    glow: "shadow-green-200",
  },
  error: {
    bg: "bg-error-2",
    border: "border-error-1",
    extra: "after:border-error-2",
    glow: "shadow-red-200",
  },
  warning: {
    bg: "bg-warning-2",
    border: "border-warning-1",
    extra: "after:border-warning-2",
    glow: "shadow-yellow-200",
  },
  info: {
    bg: "bg-info-2",
    border: "border-info-1",
    extra: "after:border-info-2",
    glow: "shadow-blue-200",
  },
  primary: {
    bg: "bg-blue-100",
    border: "border-blue-500",
    extra: "after:border-blue-100",
    glow: "shadow-blue-300",
  },
  secondary: {
    bg: "bg-gray-100",
    border: "border-gray-400",
    extra: "after:border-gray-100",
    glow: "shadow-gray-300",
  },
  purple: {
    bg: "bg-purple-100",
    border: "border-purple-500",
    extra: "after:border-purple-100",
    glow: "shadow-purple-300",
  },
  pink: {
    bg: "bg-pink-100",
    border: "border-pink-500",
    extra: "after:border-pink-100",
    glow: "shadow-pink-300",
  },
} as const;

type IconCircleWrapperColor = keyof typeof COLOR_MAP;
type IconCircleWrapperSize = keyof typeof SIZE_MAP;

interface IconCircleWrapperProps {
  children: React.ReactNode;
  size?: IconCircleWrapperSize;
  color?: IconCircleWrapperColor;
  borderWidth?: string;
  className?: string;
  classNameIcon?: string;
  extraBorder?: boolean;

  // Enhanced options
  /** Hiệu ứng glow/shadow */
  glow?: boolean;
  /** Gradient background */
  gradient?: boolean;
  /** Gradient direction */
  gradientDirection?: "to-r" | "to-br" | "to-tr" | "to-b";
  /** Custom gradient colors */
  gradientFrom?: string;
  gradientTo?: string;
  /** Hiệu ứng hover */
  hoverEffect?: "scale" | "rotate" | "lift" | "pulse" | "glow" | "none";
  /** Animation */
  animate?: "spin" | "pulse" | "bounce" | "ping" | "none";
  /** Border style */
  borderStyle?: "solid" | "dashed" | "dotted" | "double";
  /** Icon rotation */
  rotate?: number;
  /** Shadow size */
  shadowSize?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Clickable */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Active state */
  active?: boolean;
  /** Badge */
  badge?: string | number;
  /** Status indicator */
  statusIndicator?: "online" | "offline" | "away" | "busy" | "dnd";
  /** Tooltip */
  tooltip?: string;
  /** Tooltip position */
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  /** Pattern overlay */
  pattern?: "dots" | "grid" | "stripes" | "none";
  /** Border radius override */
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  /** Padding inside */
  padding?: number;
  /** Ripple effect */
  ripple?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Notification count */
  notificationCount?: number;
  /** Opacity */
  opacity?: number;
  /** Multiple borders */
  doubleBorder?: boolean;
  /** Neon effect */
  neon?: boolean;
  /** 3D effect */
  effect3d?: boolean;
}

/**
 * Enhanced IconCircleWrapper Component
 *
 * Component wrapper tròn cho icon với nhiều hiệu ứng đẹp mắt
 *
 * Props cơ bản:
 * - children: React.ReactNode — Icon hoặc nội dung bên trong
 * - size?: IconCircleWrapperSize — Kích thước (xs, sm, md, lg, xl, 2xl, 3xl)
 * - color?: IconCircleWrapperColor — Màu sắc theme
 * - borderWidth?: string — Độ dày border (e.g., 'border-2', 'border-4')
 * - className?: string — Custom classes cho container
 * - classNameIcon?: string — Custom classes cho icon
 * - extraBorder?: boolean — Border thêm bên ngoài
 *
 * Props nâng cao:
 * - glow?: boolean — Hiệu ứng shadow/glow
 * - gradient?: boolean — Background gradient
 * - gradientDirection?: string — Hướng gradient
 * - gradientFrom/To?: string — Màu gradient tùy chỉnh
 * - hoverEffect?: string — Hiệu ứng hover (scale, rotate, lift, pulse, glow)
 * - animate?: string — Animation (spin, pulse, bounce, ping)
 * - borderStyle?: string — Kiểu border (solid, dashed, dotted, double)
 * - rotate?: number — Xoay icon (degrees)
 * - shadowSize?: string — Kích thước shadow
 * - onClick?: () => void — Click handler
 * - disabled?: boolean — Trạng thái disabled
 * - active?: boolean — Trạng thái active
 * - badge?: string | number — Badge hiển thị
 * - statusIndicator?: string — Chấm status
 * - tooltip?: string — Tooltip text
 * - tooltipPosition?: string — Vị trí tooltip
 * - pattern?: string — Pattern overlay (dots, grid, stripes)
 * - rounded?: string — Border radius
 * - padding?: number — Padding bên trong
 * - ripple?: boolean — Ripple effect
 * - loading?: boolean — Loading spinner
 * - notificationCount?: number — Số notification
 * - opacity?: number — Độ trong suốt
 * - doubleBorder?: boolean — Double border effect
 * - neon?: boolean — Neon glow effect
 * - effect3d?: boolean — 3D depth effect
 */
const IconCircleWrapper: React.FC<IconCircleWrapperProps> = ({
  children,
  size = "md",
  color = "base",
  borderWidth = "border-4",
  className,
  classNameIcon,
  extraBorder = false,
  glow = false,
  gradient = false,
  gradientDirection = "to-br",
  gradientFrom,
  gradientTo,
  hoverEffect = "none",
  animate = "none",
  borderStyle = "solid",
  rotate,
  shadowSize = "md",
  onClick,
  disabled = false,
  active = false,
  badge,
  statusIndicator,
  tooltip,
  tooltipPosition = "bottom",
  pattern = "none",
  rounded = "full",
  padding,
  ripple = false,
  loading = false,
  notificationCount,
  opacity,
  doubleBorder = false,
  neon = false,
  effect3d = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [rippleArray, setRippleArray] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const sizeClass = SIZE_MAP[size] ?? size;
  const { bg, border, extra, glow: glowColor } = COLOR_MAP[color] ?? COLOR_MAP.base;

  // Hover effect classes
  const hoverEffectClasses = {
    scale: "hover:scale-110 transition-transform duration-300",
    rotate: "hover:rotate-12 transition-transform duration-300",
    lift: "hover:-translate-y-1 hover:shadow-xl transition-all duration-300",
    pulse: "hover:animate-pulse",
    glow: `hover:shadow-lg hover:${glowColor} transition-shadow duration-300`,
    none: "",
  };

  // Animation classes
  const animationClasses = {
    spin: "animate-spin",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    ping: "animate-ping",
    none: "",
  };

  // Shadow classes
  const shadowClasses = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",
  };

  // Border style classes
  const borderStyleClasses = {
    solid: "border-solid",
    dashed: "border-dashed",
    dotted: "border-dotted",
    double: "border-double",
  };

  // Pattern classes
  const patternClasses = {
    dots: "before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] before:bg-[length:4px_4px]",
    grid: "before:absolute before:inset-0 before:rounded-full before:bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] before:bg-[length:6px_6px]",
    stripes:
      "before:absolute before:inset-0 before:rounded-full before:bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.05)_4px,rgba(0,0,0,0.05)_8px)]",
    none: "",
  };

  // Rounded classes
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  };

  // Tooltip position classes
  const tooltipPositionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const afterBorderWidthClass = extraBorder ? `after:${borderWidth}` : "";
  const afterBorderColorClass = extra;

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || loading) return;

    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setRippleArray([...rippleArray, { x, y, id }]);
      setTimeout(() => {
        setRippleArray((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    if (onClick) {
      onClick();
    }
  };

  const containerClasses = clsx(
    "relative inline-flex items-center justify-center overflow-hidden",
    roundedClasses[rounded],
    !gradient && bg,
    gradient && gradientFrom && gradientTo
      ? `bg-gradient-${gradientDirection} from-${gradientFrom} to-${gradientTo}`
      : gradient && `bg-gradient-${gradientDirection}`,
    sizeClass,
    !disabled && !loading && hoverEffectClasses[hoverEffect],
    animate !== "none" && !loading && animationClasses[animate],
    glow && shadowClasses[shadowSize],
    glow && glowColor,
    disabled && "opacity-50 cursor-not-allowed",
    !disabled && onClick && "cursor-pointer",
    active && "ring-4 ring-blue-400 ring-offset-2",
    patternClasses[pattern],
    neon && `shadow-[0_0_20px_${glowColor}]`,
    effect3d && "shadow-[0_8px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.3)]",
    className,
    'after:content-[""]',
    "after:absolute",
    extraBorder && "after:-inset-1",
    extraBorder && roundedClasses[rounded],
    afterBorderWidthClass,
    afterBorderColorClass
  );

  const borderClasses = clsx(
    "absolute inset-0",
    roundedClasses[rounded],
    borderWidth,
    border,
    borderStyleClasses[borderStyle],
    doubleBorder && "shadow-[inset_0_0_0_2px_rgba(255,255,255,0.5)]"
  );

  const innerStyle: React.CSSProperties = {
    ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}),
    ...(padding ? { padding: `${padding}px` } : {}),
    ...(opacity !== undefined ? { opacity } : {}),
  };

  return (
    <div className="inline-block relative">
      <div
        className={containerClasses}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Ripple effects */}
        {ripple &&
          rippleArray.map((rippleItem) => (
            <span
              key={rippleItem.id}
              className="absolute bg-white rounded-full opacity-40 animate-ping pointer-events-none"
              style={{
                left: rippleItem.x,
                top: rippleItem.y,
                width: 20,
                height: 20,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}

        <div className={borderClasses} />

        {/* Status indicator */}
        {statusIndicator && (
          <span
            className={clsx(
              "absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white z-10",
              statusIndicator === "online" && "bg-green-500",
              statusIndicator === "offline" && "bg-gray-400",
              statusIndicator === "away" && "bg-yellow-500",
              statusIndicator === "busy" && "bg-red-500",
              statusIndicator === "dnd" && "bg-purple-500"
            )}
          />
        )}

        {/* Loading spinner */}
        {loading ? (
          <div className="animate-spin">
            <div className="w-1/2 h-1/2 rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : (
          <div className={clsx(classNameIcon, "relative z-[1]")} style={innerStyle}>
            {children}
          </div>
        )}

        {/* Badge */}
        {badge && !loading && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[18px] text-center z-10">
            {badge}
          </span>
        )}

        {/* Notification count */}
        {notificationCount !== undefined && notificationCount > 0 && !badge && !loading && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[18px] text-center z-10">
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && isHovered && !disabled && (
        <div
          className={clsx(
            "absolute z-50 px-2 py-1 text-xs text-white whitespace-nowrap bg-gray-900 rounded shadow-lg pointer-events-none",
            tooltipPositionClasses[tooltipPosition]
          )}
        >
          {tooltip}
          <div
            className={clsx(
              "absolute w-2 h-2 transform rotate-45 bg-gray-900",
              tooltipPosition === "top" && "top-full left-1/2 -translate-x-1/2 -mt-1",
              tooltipPosition === "bottom" && "bottom-full left-1/2 -translate-x-1/2 -mb-1",
              tooltipPosition === "left" && "left-full top-1/2 -translate-y-1/2 -ml-1",
              tooltipPosition === "right" && "right-full top-1/2 -translate-y-1/2 -mr-1"
            )}
          />
        </div>
      )}
    </div>
  );
};

export default IconCircleWrapper;
