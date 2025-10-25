import * as React from "react";

import clsx from "clsx";

import { useNSTranslate } from "@/shared/hooks";

import Button, { ButtonSize } from "../buttons/Button";
import Icon from "../icons/Icon";
import IconCircleWrapper from "../icons/IconCircleWrapper";
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

// Default icon mapping
const ICON_MAP: Record<IconType, React.ReactNode> = {
  info: <Icon name="InfoOutlined" className="text-info" size="base" />,
  infoXl: <Icon name="InfoOutlinedXl" className="text-info" size="xl" />,
  warning: <Icon name="WarningOutlined" className="text-warning" size="base" />,
  error: <Icon name="ErrorOutlined" className="text-error" size="base" />,
  success: <Icon name="SuccessOutlined" className="text-success" size="base" />,
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
  /** Whether to disable confirm button */
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
  <div className={clsx("flex w-full justify-end gap-3", className)}>
    <div className={clsx(fullWidth && "flex-1")}>
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
    <div className={clsx(fullWidth && "flex-1")}>
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
  showIcon = false,
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
}) => {
  const t = useNSTranslate();

  const [checked, setChecked] = React.useState(false);

  // Determine which icon to render
  const iconNode = customIcon ?? ICON_MAP[iconType];

  // Build header: either fully custom or default layout
  const headerNode =
    customHeader ??
    (() => {
      const hasIcon = showIcon && iconNode;
      const hasClose = showCloseIcon;
      const hasTitle = Boolean(title);

      const hasIconRow = hasIcon || (hasClose && !hasTitle);
      const hasTitleRow = hasTitle;
      const showCloseInTitleRow = hasClose && hasTitle && !hasIconRow;
      const closeIconColor = "text-neutral-7";

      return (
        <div className={clsx("flex flex-col items-start gap-6")}>
          {/* Row icon + close */}
          {hasIconRow && (
            <div className="flex items-center justify-between w-full">
              <div className="mt-1">
                {hasIcon && <IconCircleWrapper>{iconNode}</IconCircleWrapper>}
              </div>
              {hasClose && !showCloseInTitleRow && (
                <Icon
                  name="CloseOutlined"
                  className={closeIconColor}
                  size="base"
                  onClick={onCancel}
                />
              )}
            </div>
          )}

          {/* Row title + close (if not shown above) */}
          {hasTitleRow && (
            <div className="flex items-center justify-between w-full">
              <div className="text-title-20-bold text-neutral-9">{title}</div>
              {showCloseInTitleRow && (
                <Icon
                  name="CloseOutlined"
                  className={closeIconColor}
                  size="base"
                  onClick={onCancel}
                />
              )}
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
      headerPadding="pb-2"
      footer={footer}
      hideFooter={hideFooter}
      disabled={disabled}
    >
      <div className={clsx("text-body-14 text-neutral-7", contentClassName)}>{content}</div>
      {showRowCheckbox && (
        <div className="flex items-center gap-2 mt-4">
          <div>
            <Checkbox checked={checked} onCheckedChange={(val) => setChecked(val === true)} />
          </div>
          <div className="text-body-13 text-neutral-9">{contentCheckbox}</div>
        </div>
      )}
    </Modal>
  );
};

export default ConfirmModal;
