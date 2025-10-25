import React, { useCallback } from "react";

// Define OVERFLOW_VALUE locally since the import path doesn't exist
const OVERFLOW_VALUE = "...";

import Icon, { IconSize } from "@/foundation/components/icons/Icon";

import DropDown from "../dropdown/DropDown";
import DropDownTrigger from "../dropdown/DropDownTrigger";
import { ButtonSize } from "../../buttons/Button";
import { DropdownMenuItem } from "../dropdown/DropDownListItem";

export type MenuDropdownItemVariant = "default" | "button";

export interface MenuDropdownItemProps {
  label: string;
  value: string;
  /** Nếu có dropdown con */
  items?: DropdownMenuItem[];
  /** Active state để highlight */
  highlight?: boolean;
  /** Callback khi click vào trigger của item */
  onClick?: (value: string) => void;
  /** Variant của trigger: 'default' sử dụng style cũ, 'button' sử dụng DropdownTrigger style mới */
  variant?: MenuDropdownItemVariant;
  /** Nếu true, hiển thị label của active descendant (nếu có) thay cho label gốc */
  displayActiveChildName?: boolean;
  /** Giá trị active hiện tại */
  activeValue?: string;
  /** Kích thước icon */
  iconSize?: IconSize;
  /** Số lượng item con tối thiểu để hiển thị icon */
  minChild?: number;
  displayIconDropDown?: boolean;
  sizeButton?: ButtonSize;
  buttonClassName?: string;
  classCustom?: string;
}

/** Hàm tìm label của descendant active (đệ quy) */
const getActiveDescendantLabel = (items: DropdownMenuItem[]): string | null => {
  for (const child of items) {
    if (child.highlight) {
      // Nếu child có children và có descendant active thì đệ quy
      if (child.childrenItem && child.childrenItem.length > 0) {
        const descendant = getActiveDescendantLabel(child.childrenItem);
        return descendant || child.label;
      }
      return child.label;
    }
  }
  return null;
};

const MenuDropdownItem: React.FC<MenuDropdownItemProps> = ({
  label,
  value,
  items = [],
  highlight = false,
  onClick,
  variant = "default",
  displayActiveChildName = false,
  activeValue,
  iconSize = "md",
  minChild = 0,
  displayIconDropDown = true,
  sizeButton = "md",
  buttonClassName = "",
  classCustom = "",
}) => {
  const handleTriggerClick = useCallback(() => {
    if (onClick) {
      onClick(value);
    }
  }, [onClick, value]);

  // Nếu bật displayActiveChildName và có activeValue khác với chính item, lấy label của descendant active nếu có
  let effectiveLabel = label;
  if (displayActiveChildName && activeValue && activeValue !== value && items && items.length > 0) {
    const descendantLabel = getActiveDescendantLabel(items);
    if (descendantLabel) {
      effectiveLabel = descendantLabel;
    }
  }

  if (variant === "button") {
    // Sử dụng DropdownTrigger với style button
    const triggerVariant = highlight ? "primary" : "textSecondary";
    const triggerIconColor = highlight ? "white" : "currentColor";
    const triggerColorClassName = highlight ? "text-base-white" : "text-neutral-4";

    return (
      <div className="h-full" onMouseLeave={() => {}}>
        <DropDown
          trigger={
            <DropDownTrigger
              label={effectiveLabel}
              iconName={
                items.length > minChild && displayIconDropDown && value !== OVERFLOW_VALUE
                  ? "DownArrow"
                  : undefined
              }
              iconSize={iconSize}
              variant={triggerVariant}
              iconColor={triggerIconColor}
              colorClassName={triggerColorClassName}
              className={`!text-body-14-medium ${buttonClassName}`}
              onClick={handleTriggerClick}
              sizeButton={sizeButton}
            />
          }
          items={items}
          sideOffset={0}
          variant="button"
          hiddenHoverCard={items.length === minChild}
          paddingY="py-3"
          paddingX="px-4"
        />
      </div>
    );
  } else {
    // Kiểu default cũ
    return (
      <div className="h-full" onMouseLeave={() => {}}>
        <DropDown
          trigger={
            <div
              className={`relative box-border flex cursor-pointer select-none items-center gap-x-1 ${
                highlight ? "text-body-14-bold text-neutral-10" : `text-neutral-7 ${classCustom}`
              } `}
              onClick={handleTriggerClick}
            >
              {highlight && (
                <span className="absolute inset-x-0 top-[calc(100%+4px)] h-[2px] w-full bg-primary-6" />
              )}
              <span>{effectiveLabel}</span>
              {displayIconDropDown && (
                <span className="flex gap-x-2 items-center">
                  {items && items.length > 1 && <Icon name="DownArrow" size="sm" />}
                </span>
              )}
            </div>
          }
          items={items}
          variant="text"
          hiddenHoverCard={items.length === 1}
          paddingY="py-3"
          paddingX="px-4"
        />
      </div>
    );
  }
};

export default MenuDropdownItem;
