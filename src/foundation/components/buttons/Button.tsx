import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonColor = "blue" | "red" | "green" | "purple";

export type ButtonGradient =
  | "blue-purple"
  | "pink-orange"
  | "green-blue"
  | "purple-pink"
  | "orange-red"
  | "cyan-blue";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export type ButtonVariant =
  | "solid"
  | "outline"
  | "ghost"
  | "gradient"
  | "outlined"
  | "primary"
  | "text"
  | "textSecondary";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ButtonColor;
  gradient?: ButtonGradient;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  shadow?: boolean;
  children?: React.ReactNode;
  testId?: string;
}

const Button = ({
  color = "blue",
  gradient,
  variant = "solid",
  size = "md",
  fullWidth = false,
  rounded = "md",
  icon,
  iconPosition = "left",
  loading = false,
  shadow = false,
  disabled = false,
  children,
  className = "",
  testId,
  ...props
}: ButtonProps) => {
  // Base classes
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Size classes
  const sizeClasses = {
    xs: "text-xs px-2 py-1 gap-1",
    sm: "text-sm px-3 py-1.5 gap-1.5",
    md: "text-base px-4 py-2 gap-2",
    lg: "text-lg px-6 py-3 gap-2",
    xl: "text-xl px-8 py-4 gap-3",
    "2xl": "text-2xl px-10 py-5 gap-3",
  };

  // Rounded classes
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  // Color-based variant classes aligned with colors.json tokens
  // primary-* (blue scale), success, error, brand
  const colorVariants = {
    blue: {
      solid: "bg-primary-6 text-button-text hover:bg-primary-7 focus:ring-primary-6",
      outline: "border-2 border-primary-6 text-primary-6 hover:bg-primary-10 focus:ring-primary-6",
      ghost: "text-primary-6 hover:bg-primary-10 focus:ring-primary-6",
    },
    red: {
      solid: "bg-error text-button-text hover:bg-error/90 focus:ring-error",
      outline: "border-2 border-error text-error hover:bg-error/10 focus:ring-error",
      ghost: "text-error hover:bg-error/10 focus:ring-error",
    },
    green: {
      solid: "bg-success text-button-text hover:bg-success/90 focus:ring-success",
      outline: "border-2 border-success text-success hover:bg-success/10 focus:ring-success",
      ghost: "text-success hover:bg-success/10 focus:ring-success",
    },
    purple: {
      solid: "bg-brand text-button-text hover:bg-primary-6 focus:ring-brand",
      outline: "border-2 border-brand text-brand hover:bg-primary-10 focus:ring-brand",
      ghost: "text-brand hover:bg-primary-10 focus:ring-brand",
    },
  } as const;

  // Gradient classes
  const gradientClasses = {
    "blue-purple":
      "bg-gradient-to-r from-primary-6 to-brand text-button-text hover:from-primary-7 hover:to-primary-6 focus:ring-primary-6",
    "pink-orange":
      "bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:from-pink-600 hover:to-orange-600 focus:ring-pink-500",
    "green-blue":
      "bg-gradient-to-r from-success to-primary-6 text-button-text hover:from-success/90 hover:to-primary-7 focus:ring-success",
    "purple-pink":
      "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 focus:ring-purple-500",
    "orange-red":
      "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 focus:ring-orange-500",
    "cyan-blue":
      "bg-gradient-to-r from-cyan-500 to-primary-6 text-button-text hover:from-cyan-600 hover:to-primary-7 focus:ring-cyan-500",
  };

  // Determine variant classes
  const getVariantClasses = () => {
    if (variant === "gradient" && gradient) {
      return gradientClasses[gradient];
    }
    if (variant === "outlined") {
      return colorVariants[color]["outline"];
    }
    if (variant === "primary") {
      return colorVariants[color]["solid"];
    }
    return colorVariants[color][variant as keyof (typeof colorVariants)[typeof color]];
  };

  // Combine all classes
  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    roundedClasses[rounded],
    getVariantClasses(),
    shadow ? "shadow-lg hover:shadow-xl" : "",
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Render icon
  const renderIcon = () => {
    if (loading) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    return icon;
  };

  return (
    <button
      type="button"
      className={buttonClasses}
      disabled={disabled || loading}
      data-testid={testId}
      {...props}
    >
      {iconPosition === "left" && renderIcon()}
      {children && <span>{children}</span>}
      {iconPosition === "right" && renderIcon()}
    </button>
  );
};

export default Button;
