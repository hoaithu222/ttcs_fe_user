// MenuDropdown.tsx
import React, { useMemo } from "react";

import { ButtonSize } from "../../buttons/Button";
import { IconSize } from "../../icons/Icon";
import { DropdownMenuItem } from "../dropdown/DropDownListItem";
import MenuDropDownItem, { MenuDropdownItemVariant } from "./MenuDropDownItem";
import { updateHighlight, wrapOnClick } from "./menu-dropdown.utils";

export interface MenuDropdownProps {
  /** Danh sách các item */
  items: DropdownMenuItem[];
  /** Variant cho từng item: 'default' hoặc 'button' */
  itemVariant?: MenuDropdownItemVariant;
  /**
   * Nếu true (mặc định), MenuDropdown sẽ bọc onClick để tự cập nhật active state.
   * Nếu false thì onClick do người dùng khai báo sẽ được sử dụng mà không bọc.
   */
  autoUpdateActive?: boolean;
  /** Giá trị active hiện tại (dùng cho highlight) */
  activeValue?: string;
  /** Callback cập nhật active state */
  setActiveValue?: (value: string) => void;
  /** Nếu true, các item gốc sẽ hiển thị label của active descendant nếu có */
  displayActiveChildName?: boolean;
  /** Khoảng cách giữa các item */
  gap?: string;
  /** Kích thước icon */
  iconSize?: IconSize;
  /** Padding */
  padding?: string;
  /** Hiển thị icon dropdown */
  displayIconDropDown?: boolean;
  /** Kích thước button */
  sizeButton?: ButtonSize;
  /** Class tuỳ chỉnh cho button */
  buttonClassName?: string;
  /** Danh sách các item sẽ nghịch đảo boolean của displayActiveChildName */
  displayActiveChildNameExclude?: string[];
  classCustom?: string;
}

const MenuDropdown: React.FC<MenuDropdownProps> = ({
  items,
  itemVariant = "default",
  autoUpdateActive = true,
  activeValue,
  setActiveValue = () => {},
  displayActiveChildName = false,
  gap = "gap-x-8",
  iconSize = "md",
  padding = "px-8",
  displayIconDropDown = true,
  sizeButton = "md",
  buttonClassName = "",
  displayActiveChildNameExclude = [],
  classCustom = "",
}) => {
  const processedItems = useMemo(() => {
    // Bước 1: nếu autoUpdateActive thì wrap onClick, ngược lại giữ nguyên
    const withClicks = autoUpdateActive ? wrapOnClick(items, setActiveValue) : items;

    // Bước 2: nếu có activeValue thì đánh highlight, ngược lại giữ nguyên
    return activeValue ? updateHighlight(withClicks, activeValue) : withClicks;
  }, [items, autoUpdateActive, setActiveValue, activeValue]);

  return (
    <div className="flex justify-start h-full text-body-14-medium text-start">
      <div className={`flex h-full ${gap} ${padding}`}>
        {processedItems.map((item) => (
          <MenuDropDownItem
            key={item.value}
            label={item.label}
            value={item.value ?? ""}
            items={item.childrenItem}
            highlight={item.highlight}
            onClick={item.onClick}
            variant={itemVariant}
            displayActiveChildName={
              displayActiveChildNameExclude.includes(item.value ?? "")
                ? !displayActiveChildName
                : displayActiveChildName
            }
            activeValue={activeValue}
            iconSize={iconSize}
            minChild={item?.minChild}
            displayIconDropDown={displayIconDropDown}
            sizeButton={sizeButton}
            buttonClassName={buttonClassName}
            classCustom={classCustom}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuDropdown;
