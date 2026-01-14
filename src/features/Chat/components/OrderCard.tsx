import React from "react";
import { useNavigate } from "react-router-dom";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import clsx from "clsx";

interface OrderCardProps {
    orderId: string;
    orderNumber?: string;
    status: string;
    totalAmount: number;
    itemCount: number;
    createdAt?: string;
}

const OrderCard: React.FC<OrderCardProps> = ({
    orderId,
    orderNumber,
    status,
    totalAmount,
    itemCount,
    createdAt,
}) => {
    const navigate = useNavigate();

    const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
        pending: {
            label: "Chờ xác nhận",
            icon: <Clock className="w-4 h-4" />,
            color: "text-warning-6 bg-warning-1 border-warning-3",
        },
        processing: {
            label: "Đang xử lý",
            icon: <Package className="w-4 h-4" />,
            color: "text-info-6 bg-info-1 border-info-3",
        },
        shipping: {
            label: "Đang giao",
            icon: <Truck className="w-4 h-4" />,
            color: "text-primary-6 bg-primary-1 border-primary-3",
        },
        delivered: {
            label: "Đã giao",
            icon: <CheckCircle className="w-4 h-4" />,
            color: "text-success-6 bg-success-1 border-success-3",
        },
        completed: {
            label: "Hoàn thành",
            icon: <CheckCircle className="w-4 h-4" />,
            color: "text-success-6 bg-success-1 border-success-3",
        },
        cancelled: {
            label: "Đã hủy",
            icon: <XCircle className="w-4 h-4" />,
            color: "text-error-6 bg-error-1 border-error-3",
        },
    };

    const currentStatus = statusConfig[status] || statusConfig.pending;

    const handleClick = () => {
        navigate(`/user/purchase/order/${orderId}`);
    };

    return (
        <div
            onClick={handleClick}
            className="flex items-center gap-3 p-3 bg-white border border-neutral-3 rounded-lg hover:border-primary-5 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
            <div className={clsx("flex items-center justify-center w-12 h-12 rounded-lg border", currentStatus.color)}>
                {currentStatus.icon}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-neutral-10 truncate">
                        Đơn hàng #{orderNumber || orderId.slice(-6)}
                    </span>
                    <span className={clsx("text-xs px-2 py-0.5 rounded-full border font-medium", currentStatus.color)}>
                        {currentStatus.label}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-neutral-6">
                    <span>{itemCount} sản phẩm</span>
                    <span>•</span>
                    <span className="font-semibold text-primary-6">
                        {new Intl.NumberFormat("vi-VN").format(totalAmount)}đ
                    </span>
                </div>
            </div>

            <div className="text-primary-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );
};

export default OrderCard;
