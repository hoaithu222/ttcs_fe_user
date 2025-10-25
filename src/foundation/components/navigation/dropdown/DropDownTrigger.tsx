import React from "react";

import Button, { ButtonProps } from "@/foundation/components/buttons/Button";
import Icon, { IconName, IconProps, IconSize } from "@/foundation/components/icons/Icon";

import { ButtonSize } from "../../buttons/Button";

export interface DropdownTriggerProps {
  label: React.ReactNode;
  variant?: ButtonProps["variant"] | "text";
  iconName?: IconName;
  iconSize?: IconSize;
  iconColor?: IconProps["color"];
  className?: string;
  colorClassName?: string;
  onClick?: () => void;
  sizeButton?: ButtonSize;
}

const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
  label,
  variant = "textSecondary",
  iconName,
  iconSize = "sm",
  iconColor = "currentColor",
  className = "",
  colorClassName = "",
  onClick,
  sizeButton = "sm",
}) => {
  const buttonVariant = variant === "text" ? "text" : variant;

  return (
    <Button
      variant={buttonVariant}
      className={`flex items-center gap-x-1 ${className} ${colorClassName} transition-none`}
      onClick={onClick}
      size={sizeButton}
    >
      <span>{label}</span>
      {iconName && <Icon name={iconName} size={iconSize} color={iconColor} />}
    </Button>
  );
};

export default DropdownTrigger;
