import React from "react";
import Modal from "./Modal";
import IconCircleWrapper from "../icons/IconCircleWrapper";
import Button from "../buttons/Button";
import { CheckCircle2, Wallet, CreditCard } from "lucide-react";

export type SuccessModalType = "payment" | "deposit";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: SuccessModalType;
  title: string;
  message: string | React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  actionUrl?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onOpenChange,
  type,
  title,
  message,
  onConfirm,
  confirmText = "Đóng",
  actionUrl,
}) => {
  const getIcon = () => {
    switch (type) {
      case "payment":
        return <CreditCard className="w-16 h-16 text-success" />;
      case "deposit":
        return <Wallet className="w-16 h-16 text-success" />;
      default:
        return <CheckCircle2 className="w-16 h-16 text-success" />;
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      hideFooter
      showCloseIcon={false}
      hideCloseOnOutsideClick={true}
      hideCloseOnEscape={false}
      overlayDisable={true}
      className="text-center"
    >
      <div className="flex flex-col items-center justify-center py-8 px-6 space-y-6">
        {/* Icon với IconCircleWrapper */}
        <div className="flex justify-center">
          <IconCircleWrapper size="xl" color="success" borderWidth="border-4" extraBorder>
            {getIcon()}
          </IconCircleWrapper>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-neutral-9">{title}</h2>
          <div className="text-sm text-neutral-6 max-w-md mx-auto">
            {typeof message === "string" ? <p>{message}</p> : message}
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full max-w-xs">
          <Button
            variant="solid"
            color="green"
            size="lg"
            fullWidth
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;


