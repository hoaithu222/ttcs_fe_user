import React from "react";

export type IconButtonVariant =
  | "default"
  | "primary"
  | "success"
  | "danger"
  | "warning"
  | "ghost"
  | "outline"
  | "gradient";

export type IconButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export type IconButtonShape = "square" | "rounded" | "circle";

export interface IconButtonProps {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
  badge?: string | number;
  tooltip?: string;
  className?: string;
  ariaLabel?: string;
  elevation?: boolean;
  animated?: boolean;
  glow?: boolean;
  pulse?: boolean;
  notification?: boolean;
  notificationCount?: number;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = "default",
  size = "md",
  shape = "rounded",
  onClick,
  disabled = false,
  loading = false,
  active = false,
  badge,
  tooltip,
  className = "",
  ariaLabel,
  elevation = false,
  animated = false,
  glow = false,
  pulse = false,
  notification = false,
  notificationCount,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  // Size classes
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-14 h-14 text-xl",
    "2xl": "w-16 h-16 text-2xl",
  };

  // Shape classes
  const shapeClasses = {
    square: "rounded-none",
    rounded: "rounded-lg",
    circle: "rounded-full",
  };

  // Variant classes
  const variantClasses = {
    default: active
      ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    primary: active
      ? "bg-blue-700 text-white hover:bg-blue-800"
      : "bg-blue-600 text-white hover:bg-blue-700",
    success: active
      ? "bg-green-700 text-white hover:bg-green-800"
      : "bg-green-600 text-white hover:bg-green-700",
    danger: active
      ? "bg-red-700 text-white hover:bg-red-800"
      : "bg-red-600 text-white hover:bg-red-700",
    warning: active
      ? "bg-yellow-600 text-white hover:bg-yellow-700"
      : "bg-yellow-500 text-white hover:bg-yellow-600",
    ghost: active
      ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
      : "bg-transparent text-gray-700 hover:bg-gray-100",
    outline: active
      ? "bg-gray-50 border-2 border-gray-400 text-gray-900"
      : "bg-transparent border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50",
    gradient: active
      ? "bg-gradient-to-r from-purple-600 to-blue-700 text-white"
      : "bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700",
  };

  // Icon size based on button size
  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-7 h-7",
    "2xl": "w-8 h-8",
  };

  const buttonClasses = [
    "relative inline-flex items-center justify-center",
    "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
    sizeClasses[size],
    shapeClasses[shape],
    variantClasses[variant],
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
    elevation ? "shadow-md hover:shadow-lg" : "",
    animated ? "hover:scale-110 active:scale-95" : "",
    glow ? "hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]" : "",
    pulse && !disabled ? "animate-pulse" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="inline-block relative">
      <button
        type="button"
        className={buttonClasses}
        onClick={disabled || loading ? undefined : onClick}
        disabled={disabled}
        aria-label={ariaLabel || "Icon button"}
        title={tooltip}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {loading ? (
          <div className={`animate-spin ${iconSizes[size]}`}>
            <div className="w-full h-full rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : (
          <span className={iconSizes[size]}>{icon}</span>
        )}

        {/* Badge */}
        {badge && !loading && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[18px] text-center">
            {badge}
          </span>
        )}

        {/* Notification dot */}
        {notification && !notificationCount && !badge && !loading && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        )}

        {/* Notification count */}
        {notificationCount !== undefined && notificationCount > 0 && !badge && !loading && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[18px] text-center">
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        )}
      </button>

      {/* Tooltip on hover */}
      {tooltip && isHovered && !disabled && (
        <div className="absolute -bottom-8 left-1/2 z-50 px-2 py-1 text-xs text-white whitespace-nowrap bg-gray-900 rounded shadow-lg transform -translate-x-1/2">
          {tooltip}
          <div className="absolute -top-1 left-1/2 w-2 h-2 bg-gray-900 transform rotate-45 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};

// Color variant classes

export default IconButton;
