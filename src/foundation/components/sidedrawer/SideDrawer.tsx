import React from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

// import { useAppBarHeightContext } from "@/app/providers/appbar/use-app-bar-height-context";

import Button from "../buttons/Button";
import Icon from "../icons/Icon";

export type DrawerSide = "left" | "right" | "bottom";
export type DrawerSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

interface SideDrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseIcon?: boolean;
  hideCloseOnOutsideClick?: boolean;
  hideCloseOnEscape?: boolean;
  side?: DrawerSide;
  size?: DrawerSize;
  className?: string;
  contentClassName?: string;
  onCancel?: () => void;
  isHasCancelButtonDefault?: boolean;
  onConfirm?: () => void;
  isHasConfirmButtonDefault?: boolean;
  textConfirm?: string;
  textCancel?: string;
  hideFooter?: boolean;
  disableAutoFocusOnOpen?: boolean;
  testId?: string;
  titleClassName?: string;
  overlayDisable?: boolean;
  customWidth?: string;
  hideOverlay?: boolean;
  overlayClassName?: string;
  noBorder?: boolean;
  disableBtnConfirm?: boolean;
}

const widthClasses: Record<DrawerSize, string> = {
  xs: "w-10",
  sm: "w-64",
  md: "w-80",
  lg: "w-96",
  xl: "w-[32rem]",
  full: "w-full",
};

const heightClasses: Record<DrawerSize, string> = {
  xs: "h-12",
  sm: "h-40", // 10rem
  md: "h-64", // 16rem
  lg: "h-96",
  xl: "h-[32rem]", // 32rem
  full: "h-full",
};

/**
 * @component SideDrawer
 *
 * 👉 SideDrawer (ngăn trượt bên) là component dialog dạng trượt từ trái/phải màn hình, phù hợp cho các form hoặc panel phụ.
 *
 * - Dựa trên `@radix-ui/react-dialog`, tích hợp hiệu ứng slide-in/out.
 * - Hỗ trợ kích thước tùy chỉnh (`size`: sm, md, lg, xl, full).
 * - Có thể đặt bên trái hoặc phải màn hình (`side`: left, right).
 * - Tích hợp trigger button, close icon, và vùng footer có thể tuỳ biến.
 * - Hỗ trợ xác nhận (`onConfirm`) và huỷ bỏ (`onCancel`).
 * - Có thể ẩn footer hoặc ghi đè nội dung footer.
 * - Đảm bảo tính năng accessibility thông qua `Dialog.Title`, `Dialog.Description`, và `VisuallyHidden`.
 * - Hỗ trợ đóng bằng phím `Escape`, hoặc click ngoài tùy theo cài đặt.
 * - Hỗ trợ `data-testid` đầy đủ cho các vùng: trigger, overlay, content, close, confirm, cancel.
 *
 * @example
 * ```tsx
 * <SideDrawer
 *   title="Thông tin người dùng"
 *   trigger={<Button>Open</Button>}
 *   onCancel={() => console.log('cancel')}
 *   onConfirm={() => console.log('confirm')}
 *   size="lg"
 *   side="right"
 * >
 *   <UserForm />
 * </SideDrawer>
 * ```
 *
 * @props
 * - `open?: boolean` — Điều khiển mở/tắt drawer (controlled mode).
 * - `defaultOpen?: boolean` — Trạng thái mặc định khi uncontrolled.
 * - `onOpenChange?: (open: boolean) => void` — Gọi khi thay đổi trạng thái mở.
 * - `trigger?: React.ReactNode` — Element để trigger mở drawer.
 * - `title?: React.ReactNode` — Tiêu đề drawer, xuất hiện đầu trang.
 * - `description?: React.ReactNode` — Mô tả ẩn cho mục đích accessibility.
 * - `children: React.ReactNode` — Nội dung chính của drawer.
 * - `footer?: React.ReactNode` — Ghi đè vùng footer, mặc định là Cancel/Confirm.
 * - `showCloseIcon?: boolean` — Hiển thị nút đóng ở góc phải trên.
 * - `hideCloseOnOutsideClick?: boolean` — Không cho phép đóng khi click ngoài.
 * - `hideCloseOnEscape?: boolean` — Không cho phép đóng bằng Escape.
 * - `side?: 'left' | 'right'` — Drawer xuất hiện từ trái/phải.
 * - `size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'` — Chiều rộng của drawer.
 * - `className?: string` — Custom class cho vùng nội dung (children).
 * - `contentClassName?: string` — Custom class cho Dialog.Content wrapper.
 * - `onCancel?: () => void` — Hàm gọi khi click nút huỷ hoặc đóng drawer.
 * - `onConfirm?: () => void` — Hàm gọi khi click nút xác nhận.
 * - `hideFooter?: boolean` — Ẩn hoàn toàn vùng footer.
 * - `disableAutoFocusOnOpen?: boolean` — Ngăn auto focus khi drawer mở.
 * - `testId?: string` — Base ID cho test, sẽ áp dụng cho trigger, overlay, content, nút confirm/cancel, v.v.
 * - `isHasCancelButtonDefault?: boolean` — Hiển thị nút huỷ mặc định.
 * - `isHasConfirmButtonDefault?: boolean` — Hiển thị nút xác nhận mặc định.
 * - `textConfirm?: string` — Nội dung nút xác nhận.
 * - `textCancel?: string` — Nội dung nút huỷ.
 *
 * @accessibility
 * - Dùng `Dialog.Title` và `Dialog.Description` (ẩn với `VisuallyHidden`) để hỗ trợ screen reader.
 * - Tự động quản lý focus trap khi mở.
 * - Có thể disable auto focus nếu cần (`disableAutoFocusOnOpen`).
 * - Hỗ trợ đóng bằng phím `Escape` và click ngoài trừ khi bị tắt.
 */
const SideDrawer: React.FC<SideDrawerProps> = ({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description = "drawer",
  children,
  footer,
  showCloseIcon = true,
  hideCloseOnOutsideClick = false,
  hideCloseOnEscape = false,
  side = "right",
  size = "md",
  className = "",
  contentClassName = "",
  onCancel,
  onConfirm,
  hideFooter = false,
  disableAutoFocusOnOpen = false,
  testId,
  titleClassName,
  isHasCancelButtonDefault = true,
  isHasConfirmButtonDefault = true,
  textConfirm,
  textCancel,
  hideOverlay = false,
  overlayClassName,
  noBorder = true,
  disableBtnConfirm = false,
}) => {
  const { t } = useTranslation("common");
  const isSideBottom = side === "bottom";
  // const { height: appBarHeight = 0 } = useAppBarHeightContext();
  const appBarHeight = 0;

  return (
    <Dialog.Root
      open={open}
      modal={false}
      defaultOpen={defaultOpen}
      onOpenChange={hideOverlay ? undefined : onOpenChange}
    >
      {trigger && (
        <Dialog.Trigger asChild data-testid={`${testId}-trigger`}>
          {trigger}
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        {!hideOverlay && (
          <div
            data-testid={`${testId}-overlay`}
            className={clsx("fixed inset-0 z-40 bg-fallback opacity-50", overlayClassName)}
            style={{
              top: appBarHeight,
            }}
            onClick={() => {
              if (!hideCloseOnOutsideClick) onCancel?.();
            }}
          />
        )}

        <Dialog.Content
          data-testid={`${testId}-content`}
          className={clsx(
            "fixed z-50 flex flex-col overflow-auto bg-background-dialog p-5",
            // vị trí
            isSideBottom ? "inset-x-0 bottom-0" : side === "right" ? "right-0" : "left-0",
            noBorder
              ? ""
              : isSideBottom
                ? "border-t border-divider-2"
                : side === "right"
                  ? "border-l border-t border-divider-2"
                  : "border-r border-t border-divider-2",
            // kích thước
            isSideBottom ? heightClasses[size] : widthClasses[size],
            // animation
            isSideBottom
              ? "data-[state=open]:animate-in-from-bottom shadow-drawer-top data-[state=closed]:slide-out-to-bottom"
              : side === "right"
                ? "shadow-drawer-left data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
                : "shadow-drawer-left data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
            contentClassName
          )}
          style={{
            // chiều cao cho left/right
            ...(isSideBottom
              ? {}
              : { height: `calc(100vh - ${appBarHeight}px)`, top: appBarHeight }),
          }}
          onInteractOutside={(e) => {
            if (hideCloseOnOutsideClick) e.preventDefault();
            else onCancel?.();
          }}
          onEscapeKeyDown={(e) => {
            if (hideCloseOnEscape) e.preventDefault();
            else onCancel?.();
          }}
          onOpenAutoFocus={(e) => {
            if (disableAutoFocusOnOpen) e.preventDefault();
          }}
        >
          {/* Header */}
          {(title || showCloseIcon) && (
            <div className={clsx("mb-4 flex items-center justify-between", titleClassName)}>
              {title && (
                <Dialog.Title className="flex-1 min-w-0 truncate text-title-20-bold text-neutral-9">
                  {title}
                </Dialog.Title>
              )}
              {showCloseIcon && (
                <Dialog.Close asChild>
                  <Icon
                    name="CloseOutlined"
                    className="cursor-pointer text-neutral-9"
                    onClick={onCancel}
                    data-testid={`${testId}-close`}
                  />
                </Dialog.Close>
              )}
            </div>
          )}

          {/* Accessibility title */}
          {!title && (
            <VisuallyHidden asChild>
              <Dialog.Title className="flex-1 min-w-0 truncate text-title-20-bold text-neutral-9">
                {title ?? ""}
              </Dialog.Title>
            </VisuallyHidden>
          )}

          {/* Accessibility description */}
          <VisuallyHidden asChild>
            {description && (
              <Dialog.Description className="text-neutral-9">{description}</Dialog.Description>
            )}
          </VisuallyHidden>

          {/* Body */}
          <div className={clsx("flex-1 overflow-auto", className)}>{children}</div>
          {/* Footer */}
          {!hideFooter &&
            (footer ? (
              <div className="flex justify-end gap-2 mt-auto">{footer}</div>
            ) : (
              <div className="flex justify-end gap-2 px-6 py-4 mt-auto">
                {onCancel && isHasCancelButtonDefault && (
                  <Dialog.Close asChild>
                    <Button
                      onClick={onCancel}
                      variant="outlined"
                      testId={`${testId}-cancel-btn`}
                      className="flex-1"
                    >
                      {textCancel ?? t("cancel")}
                    </Button>
                  </Dialog.Close>
                )}
                {onConfirm && isHasConfirmButtonDefault && (
                  <Button
                    onClick={onConfirm}
                    variant="primary"
                    testId={`${testId}-confirm-btn`}
                    className="flex-1"
                    disabled={disableBtnConfirm}
                  >
                    {textConfirm ?? t("confirm")}
                  </Button>
                )}
              </div>
            ))}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SideDrawer;
