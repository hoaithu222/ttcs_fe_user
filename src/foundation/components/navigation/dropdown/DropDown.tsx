import { FC, ReactNode, useEffect, useState } from "react";

import * as HoverCard from "@radix-ui/react-hover-card";
import * as Popover from "@radix-ui/react-popover";

import { tailwindSpacingToPx } from "@/shared/utils/string.utils";

import DropDownContent from "./DropDownContent";
import DropDownListItem, { DropdownMenuItem } from "./DropDownListItem";

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  side?: "bottom" | "right" | "top" | "left";
  align?: "center" | "start" | "end";
  sideOffset?: number;
  variant?: "text" | "button";
  hiddenHoverCard?: boolean;
  maxRowsPerColumn?: number;
  paddingY?: string;
  paddingX?: string;
  testId?: string;
}

const splitListBalanced = <T,>(list: T[], maxRowsPerColumn: number): [T[], T[]] => {
  // Nếu số lượng item lớn hơn maxRowsPerColumn thì mới xử lý cân bảng ở dưới
  if (list.length <= maxRowsPerColumn) {
    return [list, []];
  }

  // Nếu list.length lẻ, Math.ceil sẽ làm cho left nhiều hơn right 1 phần tử
  const mid = Math.ceil(list.length / 2);
  const left = list.slice(0, mid);
  const right = list.slice(mid);
  return [left, right];
};

// Chiều cao ước tính cho mỗi item (px) — điều chỉnh nếu cần
const ITEM_HEIGHT_PX = 24;

/**
 * Dropdown
 *
 * Component dropdown tùy chỉnh, hỗ trợ hover trigger, chia cột tự động, custom layout, và recursive item rendering.
 *
 * Props:
 * - trigger: ReactNode — Phần tử kích hoạt dropdown (ví dụ: button, text link).
 * - items: DropdownMenuItem[] — Danh sách item trong dropdown (hỗ trợ đệ quy cho nested items).
 * - side?: 'bottom' | 'right' | 'top' | 'left' — Vị trí dropdown so với trigger (default: 'bottom').
 * - align?: 'center' | 'start' | 'end' — Cách căn dropdown so với trigger (default: 'start').
 * - sideOffset?: number — Khoảng cách giữa trigger và dropdown (default: 8px).
 * - variant?: 'text' | 'button' — Kiểu màu chữ trong dropdown (text nhẹ hơn hoặc button đậm hơn).
 * - hiddenHoverCard?: boolean — Ẩn hover card hiệu ứng nếu cần (default: false).
 * - maxRowsPerColumn?: number — Số dòng tối đa trên mỗi cột trước khi tách cột (default: 10).
 * - testId?: string — ID để phục vụ testing tự động.
 * - itemPaddingY?: number — Khoảng cách giữa các item (default: 3rem).
 *
 * Notes:
 * - Nếu danh sách item vượt `maxRowsPerColumn`, sẽ tự động tách làm hai cột.
 * - Dùng `RecursiveDropdownItem` để hỗ trợ menu con (nested dropdown item).
 * - Dùng `HoverCard` của Radix để trigger dropdown bằng hover, hỗ trợ keyboard accessibility.
 *
 * Example:
 * ```tsx
 * <Dropdown
 *   trigger={<Button>Options</Button>}
 *   items={[
 *     { label: 'Profile', value: 'profile' },
 *     { label: 'Settings', value: 'settings' },
 *   ]}
 * />
 * ```
 */
const Dropdown: FC<DropdownProps> = ({
  trigger,
  items,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  variant = "text",
  hiddenHoverCard = false,
  maxRowsPerColumn = 10,
  paddingY,
  paddingX,
  testId,
}) => {
  // Detect pointer mode (SSR-safe)
  const [mode, setMode] = useState<"hovercard" | "popover" | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      setMode("hovercard");
      return;
    }
    const mql = window.matchMedia("(pointer: fine)");
    const apply = () => setMode(mql.matches ? "hovercard" : "popover");
    apply();
    mql.addEventListener?.("change", apply);
    return () => mql.removeEventListener?.("change", apply);
  }, []);

  const columnMaxHeight =
    maxRowsPerColumn * (ITEM_HEIGHT_PX + (tailwindSpacingToPx(paddingY ?? "4") ?? 4) * 2);

  const customItems = items.filter((item) => item.customContent);
  const regularItems = items.filter((item) => !item.customContent);
  const [leftItems, rightItems] = splitListBalanced(regularItems, maxRowsPerColumn);

  const additionalClass = variant === "text" ? "text-neutral-7" : "text-neutral-10";

  const body = (
    <div className="flex flex-col gap-2" data-testid={`${testId}-content`}>
      {customItems.map((item, idx) => (
        <div key={`custom-${idx}`} className="p-2" data-testid={`${testId}-custom`}>
          {item.customContent}
        </div>
      ))}
      <div
        className="flex gap-1"
        style={{
          maxHeight: `${columnMaxHeight}px`,
          overflowY: items.length >= maxRowsPerColumn ? "auto" : undefined,
        }}
      >
        <ul data-testid={`${testId}-left-column`} className="flex flex-col w-full min-w-60">
          {leftItems.map((item, index) => (
            <DropDownListItem
              key={`left-${index}`}
              item={item}
              paddingY={paddingY}
              paddingX={paddingX}
            >
              {item.label}
            </DropDownListItem>
          ))}
        </ul>

        {rightItems.length > 0 && (
          <ul data-testid={`${testId}-right-column`} className="flex flex-col w-full min-w-60">
            {rightItems.map((item, index) => (
              <DropDownListItem
                key={`right-${index}`}
                item={item}
                paddingY={paddingY}
                paddingX={paddingX}
              >
                {item.label}
              </DropDownListItem>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // Mobile/Tablet: Popover
  const [open, setOpen] = useState(false);

  // Trong lúc chưa xác định mode, chỉ render trigger để tránh hydration mismatch
  if (mode === null) {
    return <div data-testid={`${testId}-trigger`}>{trigger}</div>;
  }

  if (mode === "hovercard") {
    // Desktop: HoverCard
    return (
      <HoverCard.Root openDelay={100} closeDelay={150}>
        <HoverCard.Trigger asChild>
          <div data-testid={`${testId}-trigger`}>{trigger}</div>
        </HoverCard.Trigger>

        {items.length > 0 && (
          <DropDownContent
            renderer="hovercard"
            side={side}
            align={align}
            sideOffset={sideOffset}
            hiddenHoverCard={hiddenHoverCard}
            testId={testId}
            additionalClass={additionalClass}
          >
            {body}
          </DropDownContent>
        )}
      </HoverCard.Root>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <div
          role="button"
          tabIndex={0}
          data-testid={`${testId}-trigger`}
          onPointerDown={(e) => {
            e.preventDefault(); // chặn tap-through
            setOpen((v) => !v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen((v) => !v);
            }
          }}
        >
          {trigger}
        </div>
      </Popover.Trigger>

      {items.length > 0 && (
        <DropDownContent
          renderer="popover"
          side={side}
          align={align}
          sideOffset={sideOffset}
          hiddenHoverCard={hiddenHoverCard}
          testId={testId}
          additionalClass={additionalClass}
          onOpenAutoFocus={(e) => e.preventDefault()} // không auto-focus item đầu
          onPointerUp={(e) => e.stopPropagation()} // nắn case tap-through hiếm
        >
          {body}
        </DropDownContent>
      )}
    </Popover.Root>
  );
};

export default Dropdown;
