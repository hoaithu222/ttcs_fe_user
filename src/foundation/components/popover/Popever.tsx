import * as React from "react";

import * as RadixPopover from "@radix-ui/react-popover";
import clsx from "clsx";

export interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  collisionPadding?: number;
  showArrow?: boolean;
  modal?: boolean;
  className?: string; // for Trigger wrapper
  contentClassName?: string; // for Content
  arrowClassName?: string; // for Arrow
  childrenAsChild?: boolean; // passthrough to Radix Trigger
  useBaseContentClass?: boolean; // use base content class

  /**
   * Nếu bạn đã có sẵn ref tới DOM element, truyền thẳng HTMLElement
   * hoặc hàm trả về HTMLElement để portal popover vào.
   */
  portalContainer?: HTMLElement | (() => HTMLElement);
  /**
   * Nếu bạn chỉ có id, truyền vào id này, component sẽ tự `getElementById`
   * rồi portal popover vào đó.
   */
  portalContainerId?: string;
}

const BASE_CONTENT_CLASS =
  "text-caption-11 z-50 bg-background-4 text-neutral-9 shadow-lg rounded-lg p-3";

/**
 * Popover
 *
 * Component popup nhỏ (popover) mở khi click hoặc hover vào trigger, hỗ trợ nhiều tùy chỉnh vị trí, arrow, modal mode.
 *
 * Props:
 * - children: React.ReactNode — Nội dung trigger mở popover.
 * - content: React.ReactNode — Nội dung hiển thị bên trong popover.
 * - open?: boolean — Trạng thái mở popover (controlled mode).
 * - defaultOpen?: boolean — Trạng thái mở mặc định (uncontrolled mode).
 * - onOpenChange?: (open: boolean) => void — Callback khi popover mở/đóng.
 * - side?: 'top' | 'right' | 'bottom' | 'left' — Vị trí popover so với trigger (default: 'bottom').
 * - align?: 'start' | 'center' | 'end' — Cách căn popover so với trigger (default: 'end').
 * - sideOffset?: number — Khoảng cách popover cách trigger (default: 8px).
 * - alignOffset?: number — Dịch chuyển alignment popover (default: 0px).
 * - collisionPadding?: number — Padding khi popover chạm mép màn hình (default: 8px).
 * - showArrow?: boolean — Hiển thị mũi tên chỉ từ trigger tới popover (default: false).
 * - modal?: boolean — Nếu true, popover sẽ ở chế độ modal (khóa nền phía sau).
 * - className?: string — Class bổ sung cho Trigger wrapper.
 * - contentClassName?: string — Class bổ sung cho Content.
 * - arrowClassName?: string — Class bổ sung cho Arrow nếu bật.
 * - childrenAsChild?: boolean — Bọc trigger bằng `asChild` để giữ nguyên thẻ gốc (default: true).
 *
 * Notes:
 * - Có thể dùng controlled hoặc uncontrolled tùy theo việc truyền `open`/`defaultOpen`.
 * - Nếu bật `showArrow`, sẽ render mũi tên tự động căn chỉnh theo vị trí.
 * - Sử dụng Radix Popover để đảm bảo accessibility và trải nghiệm bàn phím.
 *
 * Example:
 * ```tsx
 * <Popover
 *   content={<div className="p-4">Popover Content</div>}
 * >
 *   <Button>Open Popover</Button>
 * </Popover>
 * ```
 */
const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      children,
      content,
      open,
      defaultOpen,
      onOpenChange,
      side = "bottom",
      align = "end",
      sideOffset = 8,
      alignOffset = 0,
      collisionPadding = 8,
      showArrow = false,
      modal = false,
      className,
      contentClassName,
      arrowClassName,
      childrenAsChild = true,
      useBaseContentClass = false,

      portalContainer,
      portalContainerId,
    },
    forwardedRef
  ) => {
    // hàm lấy container cho Popover.Portal
    const resolveContainer = React.useCallback((): HTMLElement | undefined => {
      if (portalContainer) {
        return typeof portalContainer === "function" ? portalContainer() : portalContainer;
      }
      if (portalContainerId) {
        return document.getElementById(portalContainerId) || undefined;
      }
      return undefined; // -> mặc định portal ra document.body
    }, [portalContainer, portalContainerId]);

    return (
      <RadixPopover.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        modal={modal}
      >
        <RadixPopover.Trigger
          ref={forwardedRef as React.Ref<HTMLButtonElement>}
          asChild={childrenAsChild}
          className={className}
        >
          {children}
        </RadixPopover.Trigger>

        <RadixPopover.Portal container={resolveContainer()}>
          <RadixPopover.Content
            arrowPadding={8}
            side={side}
            align={align}
            sideOffset={sideOffset}
            alignOffset={alignOffset}
            collisionPadding={collisionPadding}
            className={clsx(
              useBaseContentClass && BASE_CONTENT_CLASS,
              contentClassName,
              "z-[1000]"
            )}
            onEscapeKeyDown={() => onOpenChange?.(false)}
            onPointerDownOutside={() => onOpenChange?.(false)}
          >
            {content}
            {showArrow && (
              <RadixPopover.Arrow
                offset={5}
                className={clsx(arrowClassName, "fill-background-4")}
              />
            )}
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
    );
  }
);

Popover.displayName = "Popover";

export default Popover;
