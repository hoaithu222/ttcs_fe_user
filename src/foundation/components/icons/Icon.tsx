import React from "react";
import { LucideIcon } from "lucide-react";

export interface IconProps {
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg" | "xl" | "base";
  className?: string;
  color?: string;
  onClick?: () => void;
  disabled?: boolean;
  name?: string; // Add name prop for backward compatibility
  role?: string;
  "aria-label"?: string;
  "data-testid"?: string;
  testId?: string; // Add testId prop for backward compatibility
  onKeyDown?: (e: any) => void;
  tabIndex?: number;
  key?: string;
}

// Export types for backward compatibility
export type IconSize = "sm" | "md" | "lg" | "xl" | "base";
export type IconName = string;

const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = "md",
  className = "",
  color,
  onClick,
  disabled = false,
  name, // Accept name prop but don't use it
  role,
  "aria-label": ariaLabel,
  "data-testid": dataTestId,
  testId, // Accept testId prop for backward compatibility
  onKeyDown,
  tabIndex,
  key,
  ...rest
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
    base: "w-5 h-5",
  };

  const baseClasses = `
    ${sizeClasses[size]}
    ${onClick ? "cursor-pointer" : ""}
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${className}
  `.trim();

  const iconProps = {
    className: baseClasses,
    color,
    onClick: disabled ? undefined : onClick,
    role,
    "aria-label": ariaLabel,
    "data-testid": dataTestId || testId,
    onKeyDown,
    tabIndex,
    key,
    ...rest,
  };

  if (!IconComponent) {
    return <span {...iconProps}>{name || "Icon"}</span>;
  }

  return <IconComponent {...iconProps} />;
};

export default Icon;
