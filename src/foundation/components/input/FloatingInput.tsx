import React, { useState } from "react";
import { Eye, EyeOff, Check, X, AlertTriangle } from "lucide-react";

export type FloatingInputVariant = "default" | "outlined" | "filled" | "underlined";
export type FloatingInputSize = "small" | "medium" | "large";
export type FloatingInputStatus = "default" | "success" | "error" | "warning";

export interface FloatingInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: FloatingInputVariant;
  size?: FloatingInputSize;
  status?: FloatingInputStatus;
  label?: string;
  helperText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  showPasswordToggle?: boolean;
  className?: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      variant = "outlined",
      size = "medium",
      status = "default",
      label,
      helperText,
      iconLeft,
      iconRight,
      fullWidth = false,
      showPasswordToggle = false,
      className = "",
      type = "text",
      disabled = false,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type;

    const isFloating = isFocused || hasValue || (value && value.toString().length > 0);

    const baseClasses =
      "w-full transition-all duration-300 ease-out focus:outline-none placeholder:text-gray-400 placeholder:text-sm";

    const variantClasses = {
      default:
        "border-2 border-gray-200 bg-white rounded-xl focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10",
      outlined:
        "border-2 border-gray-200 bg-white rounded-xl focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10",
      filled:
        "border-0 bg-gray-50 rounded-xl focus:bg-white focus:shadow-lg focus:shadow-gray-500/10 focus:ring-2 focus:ring-blue-500/20",
      underlined:
        "border-0 border-b-2 border-gray-300 bg-transparent rounded-none focus:border-blue-500 pb-2",
    };

    const sizeClasses = {
      small: "h-11 px-4 text-sm",
      medium: "h-14 px-5 text-base",
      large: "h-16 px-6 text-lg",
    };

    const statusClasses = {
      default: "",
      success: "border-green-500 focus:border-green-600 focus:shadow-green-500/10",
      error: "border-red-500 focus:border-red-600 focus:shadow-red-500/10",
      warning: "border-amber-500 focus:border-amber-600 focus:shadow-amber-500/10",
    };

    const labelClasses = {
      small: {
        floating: "-top-2.5 text-xs px-2",
        default: "top-3 text-sm",
      },
      medium: {
        floating: "-top-3 text-xs px-2",
        default: "top-4 text-base",
      },
      large: {
        floating: "-top-3 text-sm px-2",
        default: "top-5 text-lg",
      },
    };

    const getStatusIcon = () => {
      switch (status) {
        case "success":
          return <Check className="w-5 h-5 text-green-500" />;
        case "error":
          return <X className="w-5 h-5 text-red-500" />;
        case "warning":
          return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        default:
          return null;
      }
    };

    const statusIcon = getStatusIcon();

    const paddingLeft = iconLeft ? "pl-12" : "";
    const paddingRight = showPasswordToggle || statusIcon || iconRight ? "pr-12" : "";

    const inputClasses = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      status !== "default" ? statusClasses[status] : "",
      disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : "",
      paddingLeft,
      paddingRight,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const helperTextColor = {
      default: "text-gray-500",
      success: "text-green-600",
      error: "text-red-600",
      warning: "text-amber-600",
    };

    const labelColor = {
      default: isFocused ? "text-blue-600" : "text-gray-500",
      success: "text-green-600",
      error: "text-red-600",
      warning: "text-amber-600",
    };

    const labelBgClass = isFloating
      ? variant === "outlined" || variant === "default"
        ? "bg-white"
        : variant === "filled"
          ? "bg-transparent"
          : ""
      : "";

    return (
      <div className={`${fullWidth ? "w-full" : "w-auto"}`}>
        <div className="relative">
          {iconLeft && (
            <div className="absolute left-4 top-1/2 text-gray-400 -translate-y-1/2 pointer-events-none">
              {iconLeft}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            disabled={disabled}
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={""}
            onChange={(e) => {
              setHasValue(e.target.value.length > 0);
              if (props.onChange) {
                props.onChange(e);
              }
            }}
            {...props}
          />

          {label && (
            <label
              className={`
                absolute pointer-events-none transition-all duration-300 ease-out font-medium
                ${iconLeft ? "left-12" : "left-5"}
                ${isFloating ? labelClasses[size].floating : labelClasses[size].default}
                ${status !== "default" ? labelColor[status] : labelColor.default}
                ${labelBgClass}
                ${isFloating ? "scale-90" : "scale-100"}
              `}
            >
              {label}
            </label>
          )}

          <div className="flex absolute right-4 top-1/2 gap-2 items-center -translate-y-1/2">
            {showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-gray-400 rounded-lg transition-colors duration-200 hover:text-gray-600 hover:bg-gray-100"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
            {statusIcon && <div>{statusIcon}</div>}
            {iconRight && !statusIcon && <div className="text-gray-400">{iconRight}</div>}
          </div>
        </div>

        {helperText && (
          <p className={`px-1 mt-2 text-sm font-medium ${helperTextColor[status]}`}>{helperText}</p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export default FloatingInput;
