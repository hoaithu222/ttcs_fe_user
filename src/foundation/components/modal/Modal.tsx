import * as React from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import Button from "../buttons/Button";
import Icon from "../icons/Icon";

type ModalSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full"
  | "2xl"
  | "3xl"
  | "auth"
  | "detailCond"
  | "detailTco"
  | "detailIndustry"
  | "loginFailed"
  | "detailTransferMoney"
  | "detailNews";

interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseIcon?: boolean;
  hideCloseOnOutsideClick?: boolean;
  hideCloseOnEscape?: boolean;
  size?: ModalSize;
  className?: string;
  contentClassName?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  hideFooter?: boolean;
  disableAutoFocusOnOpen?: boolean;
  testId?: string;
  padding?: string;
  titleClassName?: string;
  overlayDisable?: boolean;
  closeIconWrapperClassName?: string;
  customTitle?: React.ReactNode;
  /** Whether to disable confirm button */
  disabled?: boolean;
  headerPadding?: string;
  closeText?: string;
  confirmText?: string;
  footerClassName?: string;
  customOverlay?: () => void;
}

const sizeClasses: Record<ModalSize, string> = {
  xs: "w-full max-w-xs",
  sm: "w-full max-w-sm",
  md: "w-full max-w-md",
  lg: "w-full max-w-lg",
  xl: "w-full max-w-xl",
  "2xl": "w-full max-w-2xl",
  "3xl": "w-full max-w-3xl",
  full: "w-full max-w-[90vw] h-[90vh]",
  auth: "w-full lg:max-w-[1124px] lg:h-[674px] max-w-[950px] h-[570px]",
  detailCond: "w-full max-w-[1264px]",
  detailTco: "w-full max-w-[960px]",
  detailIndustry: "w-full max-w-[1100px] h-[750px]",
  loginFailed: "w-[500px]",
  detailTransferMoney: "w-full max-w-[468px]",
  detailNews: "w-[280px] h-[660px]",
};

/**
 * Modal
 *
 * Props:
 * - open?: boolean — Control trạng thái mở modal (controlled).
 * - defaultOpen?: boolean — Trạng thái mở mặc định (uncontrolled).
 * - onOpenChange?: (open: boolean) => void — Hàm callback khi modal mở/đóng.
 * - trigger?: React.ReactNode — Node để mở modal (nút, link, icon...).
 * - title?: string | React.ReactNode — Tiêu đề modal (tùy chọn).
 * - description?: string | React.ReactNode — Mô tả ẩn, phục vụ accessibility.
 * - children: React.ReactNode — Nội dung chính của modal.
 * - footer?: React.ReactNode — Custom nội dung footer.
 * - showCloseIcon?: boolean — Hiển thị nút đóng (default: true).
 * - hideCloseOnOutsideClick?: boolean — Ngăn đóng modal khi click ra ngoài.
 * - hideCloseOnEscape?: boolean — Ngăn đóng modal khi nhấn ESC.
 * - size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | '2xl' | '3xl' — Kích thước modal (default: 'md').
 * - className?: string — Class bổ sung cho phần body (nội dung chính).
 * - contentClassName?: string — Class bổ sung cho container toàn bộ modal.
 * - onCancel?: () => void — Hàm xử lý khi cancel (click close hoặc nút hủy).
 * - onConfirm?: () => void — Hàm xử lý khi confirm (click nút xác nhận).
 * - hideFooter?: boolean — Ẩn footer mặc định.
 * - disableAutoFocusOnOpen?: boolean — Tắt tự động focus vào modal khi mở.
 * - testId?: string — Gán test ID cho các phần tử trong modal.
 * - titleClassName?: string — Class bổ sung cho title modal.
 * - overlayEnabled: true - không cho phép tương tác với phần tử ngoài model | false - cho phép
 * - closeIconWrapperClassName?: string — Class bổ sung cho icon close.
 * - padding?: string — Class bổ sung cho padding modal.
 * - headerPadding?: string — Class bổ sung cho padding header modal.
 * - closeText?: string — Text cho nút close.
 * - confirmText?: string — Text cho nút confirm.
 *
 * Notes:
 * - Footer sẽ tự sinh nút Cancel/Confirm nếu truyền `onCancel` / `onConfirm`, trừ khi custom `footer`.
 * - Đóng modal bằng click ra ngoài hoặc ESC có thể bị chặn bằng props tương ứng.
 * - Sử dụng Radix UI Dialog để quản lý mở/đóng, overlay, và accessibility.
 *
 * Example:
 * ```tsx
 * <Modal
 *   trigger={<Button>Open Modal</Button>}
 *   title="Example Modal"
 *   onConfirm={() => console.log('Confirmed')}
 *   onCancel={() => console.log('Cancelled')}
 * >
 *   <div>Modal content here</div>
 * </Modal>
 * ```
 */

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      defaultOpen,
      onOpenChange,
      trigger,
      title,
      description,
      children,
      footer,
      showCloseIcon = true,
      hideCloseOnOutsideClick = false,
      hideCloseOnEscape = false,
      size = "md",
      className = "",
      contentClassName = "",
      onCancel,
      onConfirm,
      hideFooter = false,
      disableAutoFocusOnOpen = false,
      padding = "p-5",
      testId,
      titleClassName,
      overlayDisable = true,
      closeIconWrapperClassName,
      customTitle,
      disabled,
      headerPadding = "pb-6",
      closeText,
      confirmText,
      footerClassName,
      customOverlay,
    },
    ref
  ) => {
    const { t: tCommon } = useTranslation("common");

    const contentStyles = clsx(
      "shadow-1 fixed left-1/2 top-1/2 z-50 flex origin-center -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-neutral-2 bg-background-popup focus:outline-none",
      sizeClasses[size],
      contentClassName,
      padding
    );

    const renderTitle = () => {
      const hasCustomTitle = !!customTitle;
      const hasTitle = !!title;
      const shouldRenderWrapper = hasCustomTitle || hasTitle || showCloseIcon;

      if (!shouldRenderWrapper) return null;

      return (
        <div className={clsx("flex items-center justify-between gap-4", headerPadding)}>
          {/* Title bên trái */}
          <div className="flex-1">
            {hasCustomTitle ? (
              <>
                {customTitle}
                <VisuallyHidden asChild>
                  <Dialog.Title>Modal Title</Dialog.Title>
                </VisuallyHidden>
              </>
            ) : hasTitle ? (
              <Dialog.Title className={clsx("text-title-20-bold text-neutral-9", titleClassName)}>
                {title}
              </Dialog.Title>
            ) : (
              <VisuallyHidden asChild>
                <Dialog.Title>Modal Title</Dialog.Title>
              </VisuallyHidden>
            )}
          </div>

          {/* Close icon bên phải */}
          {showCloseIcon && (
            <div className={clsx(closeIconWrapperClassName)}>
              <Dialog.Close asChild>
                <Icon
                  name="CloseOutlined"
                  aria-label={tCommon("close")}
                  onClick={handleClose}
                  data-testid={`${testId}-close`}
                  className="text-neutral-7"
                />
              </Dialog.Close>
            </div>
          )}
        </div>
      );
    };

    const classOverlay = clsx(
      "bg-base-black/50 fixed inset-0 z-40 backdrop-blur-sm transition-opacity",
      "data-[state=open]:animate-in data-[state=open]:fade-in",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out"
    );

    const handleClose = () => {
      onCancel?.();
      onOpenChange?.(false);
    };

    return (
      <Dialog.Root
        modal={overlayDisable}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        {trigger && (
          <Dialog.Trigger asChild data-testid={`${testId}-trigger`}>
            {trigger}
          </Dialog.Trigger>
        )}
        <Dialog.Portal>
          {customOverlay ? (
            <div className={classOverlay} onClick={customOverlay} />
          ) : (
            <Dialog.Overlay className={classOverlay} data-testid={`${testId}-overlay`} />
          )}
          <Dialog.Content
            ref={ref}
            className={contentStyles}
            onInteractOutside={(e) => {
              if (hideCloseOnOutsideClick) e.preventDefault();
              else handleClose();
            }}
            onEscapeKeyDown={(e) => {
              if (hideCloseOnEscape) e.preventDefault();
              else handleClose();
            }}
            onOpenAutoFocus={(e) => {
              if (disableAutoFocusOnOpen) {
                e.preventDefault();
              }
            }}
          >
            {/* Title */}
            {renderTitle() ?? (
              <VisuallyHidden asChild>
                <Dialog.Title>Modal Title</Dialog.Title>
              </VisuallyHidden>
            )}

            {description ? (
              <Dialog.Description className="text-neutral-9">{description}</Dialog.Description>
            ) : (
              <VisuallyHidden asChild>
                <Dialog.Description>Modal Description</Dialog.Description>
              </VisuallyHidden>
            )}

            <div className={clsx("flex-1", hideFooter && "mb-4", className)}>{children}</div>
            {!hideFooter &&
              (footer ? (
                <div className={clsx("mt-6 flex justify-end gap-2", footerClassName)}>{footer}</div>
              ) : onCancel || onConfirm ? (
                <div className="flex justify-end w-full gap-2 mt-6">
                  {onCancel && (
                    <Dialog.Close asChild>
                      <Button
                        onClick={onCancel}
                        variant="outlined"
                        testId={`${testId}-cancel-btn`}
                        className="flex-1"
                      >
                        {closeText || tCommon("cancel")}
                      </Button>
                    </Dialog.Close>
                  )}
                  {onConfirm && (
                    <Button
                      onClick={disabled ? undefined : onConfirm}
                      variant="primary"
                      testId={`${testId}-confirm-btn-${disabled ? "disabled" : "enabled"}`}
                      disabled={disabled}
                      className="flex-1"
                    >
                      {confirmText || tCommon("confirm")}
                    </Button>
                  )}
                </div>
              ) : null)}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
);

Modal.displayName = "Modal";
export default Modal;
