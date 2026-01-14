import React, { createContext, useContext, useState, useCallback } from "react";
import SuspendedUserModal from "@/shared/components/SuspendedUserModal";

interface SuspendedUserContextType {
    showSuspendedModal: (message?: string) => void;
}

const SuspendedUserContext = createContext<SuspendedUserContextType | undefined>(
    undefined
);

export const SuspendedUserProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState<string>();

    const showSuspendedModal = useCallback((customMessage?: string) => {
        setMessage(customMessage);
        setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setMessage(undefined);
    }, []);

    // Listen for account status errors from http-client
    React.useEffect(() => {
        const handleAccountStatusError = (event: CustomEvent) => {
            const { code, message: errorMessage } = event.detail;

            if (code === "ACCOUNT_SUSPENDED") {
                showSuspendedModal(errorMessage || "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.");
            } else if (code === "ACCOUNT_INACTIVE") {
                showSuspendedModal(errorMessage || "Vui lòng xác thực email để tiếp tục sử dụng dịch vụ.");
            }
        };

        window.addEventListener("ACCOUNT_STATUS_ERROR", handleAccountStatusError as EventListener);

        return () => {
            window.removeEventListener("ACCOUNT_STATUS_ERROR", handleAccountStatusError as EventListener);
        };
    }, [showSuspendedModal]);

    return (
        <SuspendedUserContext.Provider value={{ showSuspendedModal }}>
            {children}
            <SuspendedUserModal
                isOpen={isOpen}
                onClose={handleClose}
                message={message}
            />
        </SuspendedUserContext.Provider>
    );
};

export const useSuspendedUser = () => {
    const context = useContext(SuspendedUserContext);
    if (!context) {
        throw new Error(
            "useSuspendedUser must be used within SuspendedUserProvider"
        );
    }
    return context;
};
