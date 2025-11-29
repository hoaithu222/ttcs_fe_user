import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import SuccessModal, { SuccessModalType } from "@/foundation/components/modal/SuccessModal";

interface SuccessModalState {
  open: boolean;
  type: SuccessModalType | null;
  title: string;
  message: string | ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  actionUrl?: string;
}

interface SuccessModalContextValue {
  showSuccessModal: (config: {
    type: SuccessModalType;
    title: string;
    message: string | ReactNode;
    onConfirm?: () => void;
    confirmText?: string;
    actionUrl?: string;
  }) => void;
  hideSuccessModal: () => void;
}

const SuccessModalContext = createContext<SuccessModalContextValue | undefined>(undefined);

export const useSuccessModal = () => {
  const context = useContext(SuccessModalContext);
  if (!context) {
    throw new Error("useSuccessModal must be used within SuccessModalProvider");
  }
  return context;
};

export const SuccessModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<SuccessModalState>({
    open: false,
    type: null,
    title: "",
    message: "",
  });

  const showSuccessModal = useCallback((config: {
    type: SuccessModalType;
    title: string;
    message: string | ReactNode;
    onConfirm?: () => void;
    confirmText?: string;
    actionUrl?: string;
  }) => {
    setModalState({
      open: true,
      type: config.type,
      title: config.title,
      message: config.message,
      onConfirm: config.onConfirm,
      confirmText: config.confirmText,
      actionUrl: config.actionUrl,
    });
  }, []);

  const hideSuccessModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      hideSuccessModal();
    }
  }, [hideSuccessModal]);

  return (
    <SuccessModalContext.Provider value={{ showSuccessModal, hideSuccessModal }}>
      {children}
      {modalState.type && (
        <SuccessModal
          open={modalState.open}
          onOpenChange={handleOpenChange}
          type={modalState.type}
          title={modalState.title}
          message={modalState.message}
          onConfirm={modalState.onConfirm}
          confirmText={modalState.confirmText}
          actionUrl={modalState.actionUrl}
        />
      )}
    </SuccessModalContext.Provider>
  );
};

