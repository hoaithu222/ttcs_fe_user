import React from "react";
import Modal from "@/foundation/components/modal/Modal";
import Button from "@/foundation/components/buttons/Button";
import { AlertCircle } from "lucide-react";

interface SuspendedUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

const SuspendedUserModal: React.FC<SuspendedUserModalProps> = ({
    isOpen,
    onClose,
    message = "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.",
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tài khoản bị khóa"
            size="md"
        >
            <div className="flex flex-col items-center gap-4 p-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-error/10">
                    <AlertCircle className="w-8 h-8 text-error" />
                </div>

                <div className="text-center">
                    <h3 className="text-lg font-semibold text-neutral-10 mb-2">
                        Không thể thực hiện thao tác
                    </h3>
                    <p className="text-neutral-7">
                        {message}
                    </p>
                </div>

                <div className="flex gap-3 mt-4 w-full">
                    <Button
                        variant="primary"
                        className="flex-1"
                        onClick={onClose}
                    >
                        Đã hiểu
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SuspendedUserModal;
