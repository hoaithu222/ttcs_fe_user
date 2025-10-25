import React from "react";

import * as HoverCard from "@radix-ui/react-hover-card";
import * as Popover from "@radix-ui/react-popover";

interface DropdownContentProps {
  renderer: "hovercard" | "popover";
  side: "bottom" | "right" | "top" | "left";
  align: "center" | "start" | "end";
  sideOffset?: number;
  additionalClass?: string;
  children: React.ReactNode;
  hiddenHoverCard?: boolean; // giữ để tương thích
  testId?: string;

  // chỉ áp dụng cho Popover
  onOpenAutoFocus?: (e: Event) => void;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onPointerUp?: React.PointerEventHandler<HTMLDivElement>;
}

const DropdownContent: React.FC<DropdownContentProps> = ({
  renderer,
  side,
  align,
  sideOffset,
  children,
  additionalClass,
  hiddenHoverCard = false,
  testId,
  onOpenAutoFocus,
  onMouseEnter,
  onMouseLeave,
  onPointerUp,
}) => {
  const cls = `z-[99999] min-w-48 overflow-hidden rounded-md bg-background-popup shadow-md ${additionalClass ?? ""} ${
    hiddenHoverCard ? "hidden" : ""
  }`;

  if (renderer === "hovercard") {
    return (
      <HoverCard.Content
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={cls}
        data-testid={testId}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
        <HoverCard.Arrow className="fill-none" />
      </HoverCard.Content>
    );
  }

  return (
    <Popover.Content
      side={side}
      align={align}
      sideOffset={sideOffset}
      onOpenAutoFocus={onOpenAutoFocus}
      className={cls}
      data-testid={testId}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerUp={onPointerUp}
    >
      {children}
      <Popover.Arrow className="fill-none" />
    </Popover.Content>
  );
};

export default DropdownContent;
