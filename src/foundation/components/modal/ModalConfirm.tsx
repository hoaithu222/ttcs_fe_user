import * as React from "react";

import clsx from "clsx";

import { useNSTranslate } from "@/shared/hooks";

import Button, { ButtonSize } from "../buttons/Button";
import Icon from "../icons/Icon";
import { Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import Checkbox from "../input/Checkbox";
import Modal from "./Modal";

type IconType = "info" | "warning" | "error" | "success" | "none" | "infoXl";

interface ConfirmModalProps {
  // Modal control
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Header
  title?: string;
  /** Override entire header (icon + title) */
  customHeader?: React.ReactNode;
  /** Whether to show icon in header */
  showIcon?: boolean;

  // Content
  content?: string | React.ReactNode;
  contentClassName?: string;

  // Footer
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  useDefaultFooter?: boolean;
  footerClassName?: string;
  customFooter?: React.ReactNode;

  // Misc
  testId?: string;
  iconType?: IconType;
  /** Completely custom icon if provided */
  customIcon?: React.ReactNode;
  /** Render decorative icon container (circle + subtle border) */
  showDecorIcon?: boolean;
  /** Override decorative icon container colors (tailwind classes) */
  decorClasses?: {
    container?: string;
    border?: string;
    glow?: string;
  };
  /** Whether to hide footer */
  hideFooter?: boolean;
  /** Whether to disable confirm button */
  disabled?: boolean;
  /** Whether to show close icon */
  showCloseIcon?: boolean;
  /** Whether to show close icon */
  fullWidthDefaultButton?: boolean;
  /** Size button for footer default */
  sizeButtonFooter?: ButtonSize;
  /** Whether to show row checkbox */
  showRowCheckbox?: boolean;
  /** Content checkbox */
  contentCheckbox?: string;
}

// Enhanced icon mapping with larger sizes
const ICON_MAP: Record<IconType, React.ReactNode> = {
  info: <Info className="text-info w-12 h-12" strokeWidth={1.5} />,
  infoXl: <Info className="text-info w-16 h-16" strokeWidth={1.5} />,
  warning: <AlertTriangle className="text-warning w-12 h-12" strokeWidth={1.5} />,
  error: <XCircle className="text-error w-12 h-12" strokeWidth={1.5} />,
  success: <CheckCircle className="text-success w-12 h-12" strokeWidth={1.5} />,
  none: null,
};

// Default footer component
const DefaultFooter: React.FC<{
  cancelText: string;
  confirmText: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  testId: string;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: ButtonSize;
}> = ({
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
  testId,
  className,
  disabled,
  fullWidth,
  size = "md",
}) => (
  <div className={clsx("flex w-full justify-center gap-3", className)}>
    <div className={clsx(fullWidth && "flex-1 min-w-[140px]")}>
      <Button
        variant="outlined"
        onClick={onCancel}
        testId={`${testId}-cancel`}
        fullWidth
        size={size}
      >
        {cancelText}
      </Button>
    </div>
    <div className={clsx(fullWidth && "flex-1 min-w-[140px]")}>
      <Button
        size={size}
        variant="primary"
        onClick={onConfirm}
        testId={`${testId}-confirm-${disabled ? "disabled" : "enabled"}`}
        fullWidth
        disabled={disabled}
      >
        {confirmText}
      </Button>
    </div>
  </div>
);

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onOpenChange,
  title,
  customHeader,
  showIcon = true,
  content,
  contentClassName,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  useDefaultFooter = true,
  footerClassName,
  customFooter,
  testId = "confirm-modal",
  iconType = "info",
  customIcon,
  hideFooter = false,
  disabled,
  showCloseIcon = true,
  fullWidthDefaultButton = true,
  sizeButtonFooter = "md",
  showRowCheckbox = false,
  contentCheckbox,
  showDecorIcon = true,
  decorClasses,
}) => {
  const t = useNSTranslate();

  const [checked, setChecked] = React.useState(false);

  // Determine which icon to render
  const iconNode = customIcon ?? ICON_MAP[iconType];

  // Build header: either fully custom or default layout
  const headerNode =
    customHeader ??
    (() => {
      const hasClose = showCloseIcon;
      const closeIconColor = "text-neutral-7 hover:text-neutral-9 transition-colors cursor-pointer";
      const hasIcon = showIcon && iconNode;

      // Decorative classes per iconType using theme colors from colors.json
      const defaultDecor = {
        container: "bg-background-1",
        border:
          iconType === "warning"
            ? "border-warning"
            : iconType === "error"
              ? "border-error"
              : iconType === "success"
                ? "border-success"
                : iconType === "info" || iconType === "infoXl"
                  ? "border-primary-6"
                  : "border-divider-1",
        glow:
          iconType === "warning"
            ? "shadow-[0_0_0_10px_rgba(255,217,61,0.10)]"
            : iconType === "error"
              ? "shadow-[0_0_0_10px_rgba(255,107,107,0.10)]"
              : iconType === "success"
                ? "shadow-[0_0_0_10px_rgba(45,208,132,0.10)]"
                : "shadow-[0_0_0_10px_rgba(46,110,191,0.10)]",
      };

      const decor = {
        container: decorClasses?.container ?? defaultDecor.container,
        border: decorClasses?.border ?? defaultDecor.border,
        glow: decorClasses?.glow ?? defaultDecor.glow,
      };

      return (
        <div className="relative w-full flex flex-col items-center text-center gap-4 pt-2">
          {hasIcon && showDecorIcon && (
            <div className="relative animate-in zoom-in-50 duration-300">
              <div
                className={clsx(
                  "w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  decor.container,
                  decor.border,
                  decor.glow
                )}
              >
                {iconNode}
              </div>
            </div>
          )}
          {title && (
            <div className="px-6 leading-tight text-2xl md:text-3xl font-semibold text-neutral-10">
              {title}
            </div>
          )}
          {hasClose && (
            <div className="absolute right-0 top-0 p-1 rounded-full hover:bg-neutral-2 transition-colors">
              <Icon
                name="CloseOutlined"
                className={closeIconColor}
                size="base"
                onClick={onCancel}
              />
            </div>
          )}
        </div>
      );
    })();

  const footer = customFooter ? (
    customFooter
  ) : useDefaultFooter ? (
    <DefaultFooter
      cancelText={cancelText ?? t("common.cancel")}
      confirmText={confirmText ?? t("common.confirm")}
      onCancel={onCancel}
      onConfirm={onConfirm}
      testId={testId}
      className={footerClassName}
      disabled={disabled || (showRowCheckbox && !checked)}
      fullWidth={fullWidthDefaultButton}
      size={sizeButtonFooter}
    />
  ) : undefined;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      onCancel={onCancel}
      showCloseIcon={false}
      size={showRowCheckbox ? "xl" : "lg"}
      padding="p-6"
      testId={testId}
      contentClassName="bg-background-popup"
      title={headerNode}
      headerPadding="pb-3"
      footer={footer}
      hideFooter={hideFooter}
      disabled={disabled}
    >
      <div
        className={clsx(
          "text-body-14 text-neutral-7 text-center leading-relaxed px-2",
          contentClassName
        )}
      >
        {content}
      </div>
      {showRowCheckbox && (
        <div className="flex items-center justify-center gap-2 mt-4 p-3 rounded-lg bg-background-1 border border-divider-1">
          <Checkbox checked={checked} onCheckedChange={(val) => setChecked(val === true)} />
          <div className="text-body-13 text-neutral-9">{contentCheckbox}</div>
        </div>
      )}
    </Modal>
  );
};

export default ConfirmModal;
