import React from "react";

import { icons } from "@/assets/icons";
import { getTailwindHexColor } from "@/shared/utils/color.utils";
import { pxToRem } from "@/shared/utils/responsive.utils";

export type IconName = keyof typeof icons;

/**
 * Icon size values:
 * - `'ms'`: Micro Small (0.5rem ~ 8px)
 * - `'xs'`: Extra Small (0.75rem ~ 12px)
 * - `'sm'`: Small (1rem ~ 16px)
 * - `'base'`: Base (1.25rem ~ 20px)
 * - `'md'`: Medium (1.5rem ~ 24px)
 * - `'lg'`: Large (2rem ~ 32px)
 * - `'xl'`: Extra Large (2.5rem ~ 40px)
 * - `'2xl'`: 2X Large (3rem ~ 48px)
 * - `'full'`: Full (2.5rem ~ 40px)
 */
export type IconSize = "ms" | "xs" | "sm" | "base" | "md" | "lg" | "xl" | "2xl" | "full";

export interface IconProps {
  name: IconName;
  size?: IconSize;
  customSize?: number;
  className?: string;
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "neutral"
    | "white"
    | "blue"
    | "orange"
    | "normal"
    | "currentColor";
  customColor?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDoubleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onLongPress?: () => void;
  disabled?: boolean;
  /** Nếu true, sẽ render background cho icon */
  withBackground?: boolean;
  /** Màu nền cho icon (có thể là HEX, rgb,…) */
  backgroundColor?: string;
  title?: string;
  /** ID để sử dụng cho việc testing */
  testId?: string;

  // New options
  /** Hiệu ứng hover */
  hoverEffect?: "scale" | "rotate" | "pulse" | "bounce" | "glow" | "none";
  /** Xoay icon (degrees) */
  rotate?: number;
  /** Hiệu ứng animation */
  animate?: "spin" | "pulse" | "bounce" | "ping" | "none";
  /** Loading state */
  loading?: boolean;
  /** Badge hiển thị */
  badge?: string | number;
  /** Notification dot */
  notification?: boolean;
  /** Số notification */
  notificationCount?: number;
  /** Tooltip text */
  tooltip?: string;
  /** Vị trí tooltip */
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  /** Border cho icon */
  withBorder?: boolean;
  /** Màu border */
  borderColor?: string;
  /** Độ dày border */
  borderWidth?: number;
  /** Padding cho icon */
  padding?: number;
  /** Shadow */
  withShadow?: boolean;
  /** Gradient background */
  gradient?: boolean;
  /** Gradient colors */
  gradientFrom?: string;
  gradientTo?: string;
  /** Context menu */
  contextMenu?: Array<{
    label: string;
    icon?: IconName;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
  }>;
  /** Status indicator */
  statusIndicator?: "online" | "offline" | "away" | "busy" | "dnd";
  /** Active state */
  active?: boolean;
  /** Ripple effect */
  ripple?: boolean;
  /** Opacity */
  opacity?: number;
}

// Các màu theme
const themeColors = {
  primary: getTailwindHexColor("text-blue-600"),
  secondary: getTailwindHexColor("text-gray-500"),
  success: getTailwindHexColor("text-green-600"),
  warning: getTailwindHexColor("text-yellow-400"),
  danger: getTailwindHexColor("text-red-600"),
  neutral: getTailwindHexColor("text-neutral-9"),
  white: getTailwindHexColor("text-base-white"),
  blue: getTailwindHexColor("text-blue-6"),
  orange: getTailwindHexColor("text-orange-6"),
  normal: getTailwindHexColor("text-neutral-6"),
};

// Hàm chuyển đổi kích thước cố định thành pixel
const convertSize = (size: IconSize): number => {
  switch (size) {
    case "ms":
      return 10;
    case "xs":
      return 12;
    case "sm":
      return 16;
    case "base":
      return 20;
    case "md":
      return 24;
    case "lg":
      return 32;
    case "xl":
      return 40;
    case "2xl":
      return 48;
    case "full":
      return 40;
    default:
      return 24;
  }
};

// Mapping kích thước cố định sang lớp Tailwind
const defaultSizeClassMap: Record<IconSize, string> = {
  ms: "w-2.5 h-2.5",
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  base: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-10 h-10",
  "2xl": "w-12 h-12",
  full: "w-10 h-10",
};

// Hover effect classes
const hoverEffectClasses = {
  scale: "hover:scale-110 transition-transform duration-200",
  rotate: "hover:rotate-12 transition-transform duration-200",
  pulse: "hover:animate-pulse",
  bounce: "hover:animate-bounce",
  glow: "hover:drop-shadow-[0_0_8px_currentColor] transition-all duration-200",
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

// Tooltip position classes
const tooltipPositionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

/**
 * Enhanced Icon Component
 *
 * Props cơ bản:
 * - name: IconName — Tên icon (key từ bộ Icons).
 * - size?: IconSize — Kích thước icon cố định (default: 'md').
 * - customSize?: number — Kích thước pixel custom (ưu tiên hơn size nếu có).
 * - className?: string — Class bổ sung cho container icon.
 * - color?: string — Màu theme mặc định.
 * - customColor?: string — Custom màu tự do (HEX, rgb...).
 * - onClick?: (e) => void — Hàm gọi khi click icon.
 * - disabled?: boolean — Vô hiệu hóa click.
 * - withBackground?: boolean — Bật background tròn cho icon.
 * - backgroundColor?: string — Màu nền cho background.
 * - title?: string — Title tooltip của icon.
 * - testId?: string — ID cho mục đích testing.
 *
 * Props mở rộng:
 * - onDoubleClick?: (e) => void — Callback khi double click
 * - onLongPress?: () => void — Callback khi long press (500ms)
 * - hoverEffect?: string — Hiệu ứng hover (scale, rotate, pulse, bounce, glow)
 * - rotate?: number — Xoay icon (degrees)
 * - animate?: string — Animation (spin, pulse, bounce, ping)
 * - loading?: boolean — Hiển thị loading spinner
 * - badge?: string | number — Badge hiển thị
 * - notification?: boolean — Notification dot
 * - notificationCount?: number — Số notification
 * - tooltip?: string — Tooltip text
 * - tooltipPosition?: string — Vị trí tooltip
 * - withBorder?: boolean — Border cho icon
 * - borderColor?: string — Màu border
 * - borderWidth?: number — Độ dày border
 * - padding?: number — Padding
 * - withShadow?: boolean — Shadow
 * - gradient?: boolean — Gradient background
 * - gradientFrom?: string — Gradient start color
 * - gradientTo?: string — Gradient end color
 * - contextMenu?: Array — Context menu items
 * - statusIndicator?: string — Status dot
 * - active?: boolean — Active state
 * - ripple?: boolean — Ripple effect
 * - opacity?: number — Opacity (0-1)
 *
 * Example:
 * ```tsx
 * <Icon
 *   name="search"
 *   size="lg"
 *   color="primary"
 *   hoverEffect="scale"
 *   tooltip="Search"
 *   onClick={() => console.log('Clicked')}
 * />
 * ```
 */
const Icon: React.FC<IconProps> = ({
  name,
  size = "md",
  customSize,
  className = "",
  color = "currentColor",
  customColor,
  onClick,
  onDoubleClick,
  onLongPress,
  disabled,
  withBackground,
  backgroundColor,
  title,
  testId,
  hoverEffect = "none",
  rotate,
  animate = "none",
  loading = false,
  badge,
  notification = false,
  notificationCount,
  tooltip,
  tooltipPosition = "bottom",
  withBorder = false,
  borderColor,
  borderWidth = 2,
  padding,
  withShadow = false,
  gradient = false,
  gradientFrom,
  gradientTo,
  contextMenu,
  statusIndicator,
  active = false,
  ripple = false,
  opacity,
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showContextMenu, setShowContextMenu] = React.useState(false);
  const [contextMenuPos, setContextMenuPos] = React.useState({ x: 0, y: 0 });
  const [longPressTimer, setLongPressTimer] = React.useState<NodeJS.Timeout | null>(null);
  const [rippleArray, setRippleArray] = React.useState<Array<{ x: number; y: number; id: number }>>(
    []
  );

  const SvgIcon = icons[name];

  if (!SvgIcon) {
    console.warn(`⚠️ Icon "${name}" not found.`);
    return null;
  }

  // Lấy màu cuối cùng
  const finalColor =
    themeColors[color as keyof typeof themeColors] || customColor || "currentColor";

  const finalSize = customSize || pxToRem(convertSize(size));
  const sizeClass = !customSize ? defaultSizeClassMap[size] : "";

  const handleContextMenu = (e: React.MouseEvent) => {
    if (contextMenu && contextMenu.length > 0) {
      e.preventDefault();
      setContextMenuPos({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
      }, 500);
      setLongPressTimer(timer);
    }

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
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled && onDoubleClick) {
      onDoubleClick(e);
    }
  };

  const clickableClassName =
    onClick || onDoubleClick
      ? `cursor-pointer focus:outline-none ${disabled ? "!cursor-not-allowed opacity-50" : ""}`
      : "";

  const containerClasses = [
    "relative inline-flex justify-center items-center",
    clickableClassName,
    withBackground || gradient ? "rounded-full" : "",
    !disabled && hoverEffectClasses[hoverEffect],
    animate !== "none" && !loading ? animationClasses[animate] : "",
    withBorder ? `border-${borderWidth}` : "",
    withShadow ? "shadow-lg" : "",
    active ? "ring-2 ring-blue-500 ring-offset-2" : "",
    sizeClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const backgroundStyle: React.CSSProperties = {
    ...(customSize ? { width: finalSize, height: finalSize } : {}),
    ...(withBackground && backgroundColor ? { backgroundColor } : {}),
    ...(gradient && gradientFrom && gradientTo
      ? { background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }
      : {}),
    ...(withBorder && borderColor ? { borderColor } : {}),
    ...(padding ? { padding: `${padding}px` } : {}),
    ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}),
    ...(opacity !== undefined ? { opacity } : {}),
  };

  return (
    <div className="inline-block relative">
      <div
        className={containerClasses}
        style={backgroundStyle}
        title={title || tooltip}
        data-testid={testId}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Ripple effects */}
        {ripple &&
          rippleArray.map((rippleItem) => (
            <span
              key={rippleItem.id}
              className="absolute bg-current rounded-full opacity-30 animate-ping pointer-events-none"
              style={{
                left: rippleItem.x,
                top: rippleItem.y,
                width: 10,
                height: 10,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}

        {/* Status indicator */}
        {statusIndicator && (
          <span
            className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white z-10 ${
              statusIndicator === "online"
                ? "bg-green-500"
                : statusIndicator === "offline"
                  ? "bg-gray-400"
                  : statusIndicator === "away"
                    ? "bg-yellow-500"
                    : statusIndicator === "busy"
                      ? "bg-red-500"
                      : "bg-purple-500"
            }`}
          />
        )}

        {/* Loading spinner */}
        {loading ? (
          <div className={`animate-spin ${sizeClass}`}>
            <div
              className="w-full h-full rounded-full border-2 border-t-transparent"
              style={{ borderColor: finalColor, borderTopColor: "transparent" }}
            />
          </div>
        ) : (
          <div
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className={clickableClassName}
            style={{ width: finalSize, height: finalSize }}
          >
            <SvgIcon width={finalSize} height={finalSize} color={finalColor} {...props} />
          </div>
        )}

        {/* Badge */}
        {badge && !loading && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[18px] text-center z-10">
            {badge}
          </span>
        )}

        {/* Notification dot */}
        {notification && !notificationCount && !badge && !loading && (
          <span className="absolute top-0 right-0 z-10 w-2 h-2 bg-red-500 rounded-full border border-white" />
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
          className={`absolute z-50 px-2 py-1 text-xs text-white whitespace-nowrap bg-gray-900 rounded shadow-lg pointer-events-none ${tooltipPositionClasses[tooltipPosition]}`}
        >
          {tooltip}
          <div
            className={`absolute w-2 h-2 transform rotate-45 bg-gray-900 ${
              tooltipPosition === "top"
                ? "top-full left-1/2 -translate-x-1/2 -mt-1"
                : tooltipPosition === "bottom"
                  ? "bottom-full left-1/2 -translate-x-1/2 -mb-1"
                  : tooltipPosition === "left"
                    ? "left-full top-1/2 -translate-y-1/2 -ml-1"
                    : "right-full top-1/2 -translate-y-1/2 -mr-1"
            }`}
          />
        </div>
      )}

      {/* Context Menu */}
      {showContextMenu && contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowContextMenu(false)} />
          <div
            className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px] z-50"
            style={{
              top: contextMenuPos.y,
              left: contextMenuPos.x,
            }}
          >
            {contextMenu.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                  }
                  setShowContextMenu(false);
                }}
                disabled={item.disabled}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
                  item.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : item.danger
                      ? "text-red-600 hover:bg-red-50"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon && <Icon name={item.icon} size="sm" className="flex-shrink-0" />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(Icon);
