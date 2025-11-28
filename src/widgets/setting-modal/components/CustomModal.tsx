import * as React from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  children,
  width = 920,
  height = 690,
  closeOnOverlayClick = true,
  closeOnEsc = true,
}) => {
  function getOutsideTarget(ev: any): Element | null {
    // Radix chuyển qua DismissableLayer, target có thể nằm ở ev.target
    // hoặc ev.detail.originalEvent.target
    const t: EventTarget | null =
      (ev?.target as EventTarget | null) ??
      (ev?.detail?.originalEvent?.target as EventTarget | null);

    return t instanceof Element ? t : null;
  }

  function isFromRadixPopper(el: Element | null): boolean {
    return !!el?.closest?.("[data-radix-popper-content-wrapper]");
  }

  return (
    <Dialog.Root modal={false} open={open} onOpenChange={(v) => !v && onClose()}>
      <VisuallyHidden>
        <Dialog.Title>Setting Modal</Dialog.Title>
        <Dialog.Description>Setting Modal Des</Dialog.Description>
      </VisuallyHidden>

      <Dialog.Portal>
        {/* <Dialog.Overlay className='fixed inset-0 z-40 transition-opacity bg-base-black/60 backdrop-blur-sm' /> */}
        <div
          data-testid={`modal-custorm-overlay`}
          className={clsx(
            "bg-base-black/60 fixed inset-0 z-40 backdrop-blur-sm transition-opacity",
            ""
          )}
        />
        <Dialog.Content
          aria-describedby="setting-modal"
          className="fixed z-50 flex flex-col overflow-hidden -translate-x-1/2 -translate-y-1/2 border outline-none shadow-1 left-1/2 top-1/2 rounded-xl border-border-2 bg-background-3"
          style={{ width, height }}
          onInteractOutside={(e) => {
            if (!closeOnOverlayClick) e.preventDefault();
            const el = getOutsideTarget(e);

            if (isFromRadixPopper(el)) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            if (!closeOnEsc) e.preventDefault();
          }}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CustomModal;
