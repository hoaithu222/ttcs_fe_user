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

  // Color-based variant classes
  const colorVariants = {
    blue: {
      solid: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
      ghost: "text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    },
    red: {
      solid: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      outline: "border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500",
      ghost: "text-red-600 hover:bg-red-50 focus:ring-red-500",
    },
    green: {
      solid: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
      outline: "border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500",
      ghost: "text-green-600 hover:bg-green-50 focus:ring-green-500",
    },
    purple: {
      solid: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
      outline:
        "border-2 border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500",
      ghost: "text-purple-600 hover:bg-purple-50 focus:ring-purple-500",
    },
  };

  // Gradient classes
  const gradientClasses = {
    "blue-purple":
      "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-purple-500",
    "pink-orange":
      "bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:from-pink-600 hover:to-orange-600 focus:ring-pink-500",
    "green-blue":
      "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 focus:ring-green-500",
    "purple-pink":
      "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 focus:ring-purple-500",
    "orange-red":
      "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 focus:ring-orange-500",
    "cyan-blue":
      "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 focus:ring-cyan-500",
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
