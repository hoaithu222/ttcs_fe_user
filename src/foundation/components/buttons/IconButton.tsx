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
      ? "bg-neutral-3 text-neutral-9 hover:bg-neutral-4"
      : "bg-neutral-2 text-neutral-7 hover:bg-neutral-3",
    primary: active
      ? "bg-primary-7 text-button-text hover:bg-primary-8"
      : "bg-primary-6 text-button-text hover:bg-primary-7",
    success: active
      ? "bg-success/90 text-button-text hover:bg-success"
      : "bg-success text-button-text hover:bg-success/90",
    danger: active
      ? "bg-error/90 text-button-text hover:bg-error"
      : "bg-error text-button-text hover:bg-error/90",
    warning: active
      ? "bg-warning/90 text-button-text hover:bg-warning"
      : "bg-warning text-button-text hover:bg-warning/90",
    ghost: active
      ? "bg-neutral-2 text-neutral-9 hover:bg-neutral-3"
      : "bg-transparent text-neutral-7 hover:bg-neutral-2",
    outline: active
      ? "bg-neutral-1 border-2 border-neutral-5 text-neutral-9"
      : "bg-transparent border-2 border-neutral-4 text-neutral-7 hover:border-neutral-5 hover:bg-neutral-1",
    gradient: active
      ? "bg-gradient-to-r from-primary-8 to-primary-6 text-button-text"
      : "bg-gradient-to-r from-primary-7 to-primary-6 text-button-text hover:from-primary-8 hover:to-primary-7",
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
    "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6",
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
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-error text-button-text rounded-full min-w-[18px] text-center">
            {badge}
          </span>
        )}

        {/* Notification dot */}
        {notification && !notificationCount && !badge && !loading && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-error rounded-full border-2 border-background-1" />
        )}

        {/* Notification count */}
        {notificationCount !== undefined && notificationCount > 0 && !badge && !loading && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-error text-button-text rounded-full min-w-[18px] text-center">
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        )}
      </button>

      {/* Tooltip on hover */}
      {tooltip && isHovered && !disabled && (
        <div className="absolute -bottom-8 left-1/2 z-50 px-2 py-1 text-xs text-neutral-0 whitespace-nowrap bg-neutral-9 rounded shadow-lg transform -translate-x-1/2">
          {tooltip}
          <div className="absolute -top-1 left-1/2 w-2 h-2 bg-neutral-9 transform rotate-45 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};

// Color variant classes

export default IconButton;
