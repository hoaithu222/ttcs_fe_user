import React from "react";

import clsx from "clsx";

export interface DropdownMenuItem {
  label: string;
  value?: string;
  onClick?: () => void;
  children?: DropdownMenuItem[];
  childrenItem?: DropdownMenuItem[];
  disabled?: boolean;
  icon?: React.ReactNode;
  customContent?: React.ReactNode;
  highlight?: boolean;
  minChild?: number;
}

// Component cho danh sách item
const DropdownListItem: React.FC<{
  item?: DropdownMenuItem;
  highlight?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  dropdownItemClassName?: string;
  testId?: string;
  paddingY?: string;
  paddingX?: string;
}> = ({
  item: _item,
  highlight,
  onClick,
  children,
  dropdownItemClassName,
  testId,
  paddingY,
  paddingX,
}) => {
  const className = `hover:bg-purple-2 cursor-pointer w-full text-body-14`;
  return (
    <li
      onClick={onClick}
      className={clsx(
        className,
        dropdownItemClassName,
        highlight && "bg-purple-2",
        paddingY ? `${paddingY}` : "py-1",
        paddingX ? `${paddingX}` : "px-2"
      )}
      data-testid={testId}
    >
      {children}
    </li>
  );
};

export default DropdownListItem;
