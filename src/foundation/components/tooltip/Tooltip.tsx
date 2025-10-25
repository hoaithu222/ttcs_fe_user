import { FC, ReactNode } from "react";

import * as RadixTooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";

const ROUNDED_MAP = {
  none: "rounded-none",
  sm: "rounded-sm", // 2px
  base: "rounded", // 4px
  md: "rounded-md", // 6px
  lg: "rounded-lg", // 8px
  xl: "rounded-xl", // 12px
  "2xl": "rounded-2xl", // 16px
};

const PADDING_X_MAP = {
  none: "px-0",
  sm: "px-0.5",
  base: "px-1",
  md: "px-2",
  lg: "px-3",
  xl: "px-4",
  "2xl": "px-5",
};

const PADDING_Y_MAP = {
  none: "py-0",
  sm: "py-0.5",
  base: "py-1",
  md: "py-2",
  lg: "py-3",
  xl: "py-4",
  "2xl": "py-5",
};

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  /** Vị trí hiển thị: top, bottom, left, right */
  side?: "top" | "bottom" | "left" | "right";
  /** Cách căn giữa trigger */
  align?: "center" | "start" | "end";
  /** Khoảng cách so với trigger (px) */
  sideOffset?: number;
  /** Thời gian delay trước khi show (ms) */
  delayDuration?: number;
  /** ClassName tuỳ biến cho content */
  className?: string;
  /** Vô hiệu hóa hoàn toàn tooltip */
  disabled?: boolean;
  /** ID để sử dụng cho việc testing */
  testId?: string;
  /** Hiển thị arrow */
  showArrow?: boolean;
  /** ClassName tuỳ biến cho arrow */
  arrowClassName?: string;
  /** Bán kính bo tròn */
  rounded?: keyof typeof ROUNDED_MAP;
  /** Padding x */
  paddingX?: keyof typeof PADDING_X_MAP;
  /** Padding y */
  paddingY?: keyof typeof PADDING_Y_MAP;
  /** Màu nền */
  bgColor?: string;
}

/**
 * Tooltip
 *
 * Component hiển thị tooltip nhỏ khi hover hoặc focus vào trigger, hỗ trợ vị trí tùy chỉnh, delay và custom style.
 *
 * Props:
 * - children: ReactNode — Phần tử trigger để hiển thị tooltip.
 * - content: ReactNode — Nội dung hiển thị trong tooltip.
 * - side?: 'top' | 'bottom' | 'left' | 'right' — Vị trí tooltip so với trigger (default: 'top').
 * - sideOffset?: number — Khoảng cách giữa tooltip và trigger (default: 4px).
 * - delayDuration?: number — Thời gian trễ trước khi tooltip xuất hiện (default: 250ms).
 * - className?: string — Class bổ sung cho content tooltip.
 * - disabled?: boolean — Nếu true, không hiển thị tooltip (default: false).
 * - testId?: string — ID phục vụ test tự động.
 *
 * Notes:
 * - Nếu `disabled=true`, sẽ render trực tiếp `children` mà không bọc tooltip.
 * - Tooltip dùng `Radix Tooltip` để đảm bảo accessibility (hover + focus + keyboard).
 * - Tooltip có collisionPadding để tránh việc tooltip bị tràn ra ngoài viewport.
 *
 * Example:
 * ```tsx
 * <Tooltip content="Copy to clipboard">
 *   <Button icon="Copy" />
 * </Tooltip>
 * ```
 */
const Tooltip: FC<TooltipProps> = ({
  children,
  content,
  side = "top",
  align = "center",
  sideOffset = 4,
  delayDuration = 250,
  className,
  disabled = false,
  showArrow = false,
  arrowClassName = "",
  testId,
  rounded = "base",
  paddingX = "md",
  paddingY = "base",
  bgColor = "base-black",
}) => {
  if (disabled) return <>{children}</>;

  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root delayDuration={delayDuration}>
        <RadixTooltip.Trigger asChild data-testid={`${testId}-trigger`}>
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            align={align}
            sideOffset={sideOffset}
            collisionPadding={8}
            className={clsx(
              "text-caption-11 z-50 text-white shadow-lg",
              bgColor ? `bg-${bgColor}` : "bg-base-black",
              ROUNDED_MAP[rounded],
              PADDING_X_MAP[paddingX],
              PADDING_Y_MAP[paddingY],
              className
            )}
            data-testid={testId}
          >
            {content}
            {showArrow && (
              <RadixTooltip.Arrow offset={5} className={clsx(arrowClassName, "fill-base-black")} />
            )}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip;
