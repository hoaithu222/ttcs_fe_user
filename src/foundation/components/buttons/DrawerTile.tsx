import React, { useState } from "react";
import { ChevronRight, Check, Lock, Star, ExternalLink } from "lucide-react";

export type DrawerTileVariant =
  | "default"
  | "primary"
  | "success"
  | "danger"
  | "warning"
  | "ghost"
  | "info";
export type DrawerTileSize = "sm" | "md" | "lg";
export type DrawerTileIconPosition = "left" | "right" | "top";
export type DrawerTileAnimation = "none" | "pulse" | "bounce" | "shake";

export interface DrawerTileProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  badge?: string | number;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onLongPress?: () => void;
  className?: string;
  testId?: string;
  disabled?: boolean;
  active?: boolean;
  variant?: DrawerTileVariant;
  size?: DrawerTileSize;
  iconPosition?: DrawerTileIconPosition;
  showArrow?: boolean;
  showCheckmark?: boolean;
  loading?: boolean;
  locked?: boolean;
  featured?: boolean;
  notification?: boolean;
  notificationCount?: number;
  rightContent?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: "sm" | "md" | "lg" | "full";
  elevation?: boolean;

  // New options
  animation?: DrawerTileAnimation;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  contextMenu?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
  }>;
  tooltip?: string;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  gradient?: boolean;
  pattern?: "dots" | "grid" | "stripes" | "none";
  icon2?: React.ReactNode;
  leftAction?: {
    icon: React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
    label?: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
    label?: string;
  };
  progress?: number;
  statusIndicator?: "online" | "offline" | "away" | "busy";
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  children?: React.ReactNode;
  href?: string;
  target?: "_blank" | "_self";
  imageUrl?: string;
  hoverScale?: boolean;
}

const DrawerTile: React.FC<DrawerTileProps> = ({
  icon,
  label,
  description,
  badge,
  onClick,
  onDoubleClick,
  onLongPress,
  className = "",
  testId,
  disabled = false,
  active = false,
  variant = "default",
  size = "md",
  iconPosition = "left",
  showArrow = false,
  showCheckmark = false,
  loading = false,
  locked = false,
  featured = false,
  notification = false,
  notificationCount,
  rightContent,
  fullWidth = true,
  rounded = "lg",
  elevation = false,
  animation = "none",
  draggable = false,
  onDragStart,
  onDragEnd,
  contextMenu,
  tooltip,
  selectable = false,
  selected = false,
  onSelect,
  gradient = false,
  pattern = "none",
  icon2,
  leftAction,
  rightAction,
  progress,
  statusIndicator,
  collapsible = false,
  defaultCollapsed = false,
  children,
  href,
  target,
  imageUrl,
  hoverScale = false,
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (contextMenu && contextMenu.length > 0) {
      e.preventDefault();
      setContextMenuPos({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
  };

  const handleMouseDown = () => {
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(!selected);
    }
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
    if (onClick && !disabled && !locked) {
      onClick();
    }
  };

  // Base classes
  const baseClasses =
    "flex items-center gap-3 transition-all duration-200 cursor-pointer relative overflow-hidden";

  // Variant classes
  const variantClasses = {
    default:
      active || selected
        ? "bg-blue-50 border-blue-200 text-blue-700"
        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300",
    primary:
      active || selected
        ? "bg-blue-600 border-blue-700 text-white"
        : "bg-blue-500 border-blue-600 text-white hover:bg-blue-600",
    success:
      active || selected
        ? "bg-green-600 border-green-700 text-white"
        : "bg-green-500 border-green-600 text-white hover:bg-green-600",
    danger:
      active || selected
        ? "bg-red-600 border-red-700 text-white"
        : "bg-red-500 border-red-600 text-white hover:bg-red-600",
    warning:
      active || selected
        ? "bg-yellow-500 border-yellow-600 text-white"
        : "bg-yellow-400 border-yellow-500 text-white hover:bg-yellow-500",
    ghost:
      active || selected
        ? "bg-gray-100 border-transparent text-gray-900"
        : "bg-transparent border-transparent text-gray-700 hover:bg-gray-100",
    info:
      active || selected
        ? "bg-cyan-600 border-cyan-700 text-white"
        : "bg-cyan-500 border-cyan-600 text-white hover:bg-cyan-600",
  };

  // Size classes
  const sizeClasses = {
    sm: iconPosition === "top" ? "flex-col p-3 text-xs" : "px-3 py-2 text-sm gap-2",
    md: iconPosition === "top" ? "flex-col p-4 text-sm" : "px-4 py-3 text-base gap-3",
    lg: iconPosition === "top" ? "flex-col p-5 text-base" : "px-5 py-4 text-lg gap-4",
  };

  // Icon size based on tile size
  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Rounded classes
  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  // Animation classes
  const animationClasses = {
    none: "",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    shake: "animate-shake",
  };

  // Pattern classes
  const patternStyles = {
    none: "",
    dots: "bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[length:8px_8px]",
    grid: "bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:10px_10px]",
    stripes:
      "bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.05)_10px,rgba(0,0,0,0.05)_20px)]",
  };

  // Direction classes
  const directionClasses =
    iconPosition === "top" ? "flex-col items-center text-center" : "flex-row";

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    directionClasses,
    animationClasses[animation],
    patternStyles[pattern],
    "border",
    fullWidth ? "w-full" : "",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    elevation ? "shadow-md hover:shadow-lg" : "",
    featured ? "ring-2 ring-yellow-400 ring-offset-2" : "",
    gradient && variant === "primary" ? "bg-gradient-to-r from-blue-500 to-purple-600" : "",
    gradient && variant === "success" ? "bg-gradient-to-r from-green-500 to-teal-600" : "",
    gradient && variant === "danger" ? "bg-gradient-to-r from-red-500 to-pink-600" : "",
    hoverScale ? "hover:scale-105" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const Component = href ? "a" : "button";
  const componentProps = href
    ? { href, target, rel: target === "_blank" ? "noopener noreferrer" : undefined }
    : { type: "button" as const };

  return (
    <div className="relative w-full">
      <Component
        {...componentProps}
        data-testid={testId}
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={href ? undefined : disabled}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={buttonClasses}
      >
        {/* Image Background */}
        {imageUrl && (
          <div className="absolute inset-0 opacity-20">
            <img src={imageUrl} alt="" className="object-cover w-full h-full" />
          </div>
        )}

        {/* Featured star indicator */}
        {featured && (
          <Star className="absolute top-2 right-2 z-10 w-4 h-4 text-yellow-500 fill-yellow-500" />
        )}

        {/* Notification dot */}
        {notification && !notificationCount && (
          <span className="absolute top-2 right-2 z-10 w-2 h-2 bg-red-500 rounded-full" />
        )}

        {/* Status indicator */}
        {statusIndicator && (
          <span
            className={`absolute top-2 left-2 w-3 h-3 rounded-full border-2 border-white z-10 ${
              statusIndicator === "online"
                ? "bg-green-500"
                : statusIndicator === "offline"
                  ? "bg-gray-400"
                  : statusIndicator === "away"
                    ? "bg-yellow-500"
                    : "bg-red-500"
            }`}
          />
        )}

        {/* Left Action */}
        {leftAction && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              leftAction.onClick(e);
            }}
            className="flex-shrink-0 p-1 rounded transition-colors hover:bg-black hover:bg-opacity-10"
            title={leftAction.label}
          >
            {leftAction.icon}
          </button>
        )}

        {/* Icon Section */}
        {(icon || locked || loading) && (
          <div className="relative z-10 flex-shrink-0">
            {loading ? (
              <div className={`animate-spin ${iconSizeClasses[size]}`}>
                <div className="w-full h-full rounded-full border-2 border-current border-t-transparent" />
              </div>
            ) : locked ? (
              <Lock className={iconSizeClasses[size]} />
            ) : (
              <span className={iconSizeClasses[size]}>{icon}</span>
            )}
          </div>
        )}

        {/* Second Icon */}
        {icon2 && (
          <div className="relative z-10 flex-shrink-0">
            <span className={iconSizeClasses[size]}>{icon2}</span>
          </div>
        )}

        {/* Content Section */}
        <div className={`flex-1 ${iconPosition === "top" ? "text-center" : "text-left"} z-10`}>
          <div className="flex gap-2 justify-between items-center">
            <span className="font-medium">{label}</span>

            {/* Badge */}
            {badge && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                {badge}
              </span>
            )}

            {/* Notification count */}
            {notificationCount !== undefined && notificationCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[20px] text-center">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </div>

          {/* Description */}
          {description && <p className="mt-1 text-xs opacity-75">{description}</p>}

          {/* Progress bar */}
          {progress !== undefined && (
            <div className="mt-2 w-full bg-black bg-opacity-20 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-current transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>

        {/* Right Content Section */}
        {(rightContent || showArrow || showCheckmark || collapsible) && (
          <div className="flex z-10 flex-shrink-0 gap-2 items-center">
            {rightContent}
            {showCheckmark && (active || selected) && <Check className="w-4 h-4" />}
            {collapsible && (
              <ChevronRight
                className={`w-4 h-4 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
              />
            )}
            {showArrow && !collapsible && <ChevronRight className="w-4 h-4" />}
            {href && target === "_blank" && <ExternalLink className="w-3 h-3 opacity-50" />}
          </div>
        )}

        {/* Right Action */}
        {rightAction && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              rightAction.onClick(e);
            }}
            className="z-10 flex-shrink-0 p-1 rounded transition-colors hover:bg-black hover:bg-opacity-10"
            title={rightAction.label}
          >
            {rightAction.icon}
          </button>
        )}

        {/* Selection checkbox */}
        {selectable && (
          <div className="absolute top-2 left-2 z-10">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                selected ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"
              }`}
            >
              {selected && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
        )}
      </Component>

      {/* Collapsible content */}
      {collapsible && !isCollapsed && children && (
        <div className="pr-4 pb-2 pl-8 mt-2 text-sm text-gray-600">{children}</div>
      )}

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
          {tooltip}
          <div className="absolute top-full left-1/2 w-0 h-0 border-t-4 border-r-4 border-l-4 border-transparent transform -translate-x-1/2 border-t-gray-900" />
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
                  item.onClick();
                  setShowContextMenu(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-100 transition-colors ${
                  item.danger ? "text-red-600" : "text-gray-700"
                }`}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DrawerTile;
