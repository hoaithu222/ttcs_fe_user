import React from "react";
import { CheckCircle2, XCircle, Clock, Loader2, RefreshCw } from "lucide-react";
import type { Payment } from "@/core/api/payments/type";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Button from "@/foundation/components/buttons/Button";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";

interface PaymentStatusProps {
  payment: Payment | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  payment,
  isLoading = false,
  onRefresh,
}) => {
  if (isLoading && !payment) {
    return (
      <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary-6" />
        </div>
      </Section>
    );
  }

  if (!payment) {
    return (
      <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
        <SectionTitle className="mb-4">Trạng thái thanh toán</SectionTitle>
        <p className="text-sm text-neutral-6">Không tìm thấy thông tin thanh toán</p>
      </Section>
    );
  }

  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-success" />;
      case "failed":
      case "cancelled":
        return <XCircle className="w-6 h-6 text-error" />;
      case "processing":
        return <Loader2 className="w-6 h-6 animate-spin text-primary-6" />;
      case "pending":
      default:
        return <Clock className="w-6 h-6 text-warning" />;
    }
  };

  const getStatusLabel = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "Đã thanh toán";
      case "processing":
        return "Đang xử lý";
      case "failed":
        return "Thanh toán thất bại";
      case "cancelled":
        return "Đã hủy";
      case "refunded":
        return "Đã hoàn tiền";
      case "pending":
      default:
        return "Đang chờ thanh toán";
    }
  };

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "text-success";
      case "processing":
        return "text-primary-6";
      case "failed":
      case "cancelled":
        return "text-error";
      case "refunded":
        return "text-warning";
      case "pending":
      default:
        return "text-neutral-6";
    }
  };

  const getMethodLabel = (method: Payment["method"]) => {
    switch (method) {
      case "credit_card":
        return "Thẻ tín dụng";
      case "bank_transfer":
        return "Chuyển khoản ngân hàng";
      case "cod":
        return "Thanh toán khi nhận hàng";
      case "paypal":
        return "PayPal";
      case "vnpay":
        return "VNPay";
      case "momo":
        return "MoMo";
      case "zalopay":
        return "ZaloPay";
      case "test":
        return "Thanh toán thử nghiệm";
      default:
        return method;
    }
  };

  return (
    <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>Trạng thái thanh toán</SectionTitle>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />} 
            onClick={onRefresh}
            disabled={isLoading}
            loading={isLoading}
          >
            Làm mới
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3 p-4 bg-background-1 rounded-lg border border-border-1">
          {getStatusIcon(payment.status)}
          <div className="flex-1">
            <p className="text-sm text-neutral-6">Trạng thái</p>
            <p className={`text-base font-semibold ${getStatusColor(payment.status)}`}>
              {getStatusLabel(payment.status)}
            </p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="space-y-3 p-4 bg-background-1 rounded-lg border border-border-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-6">Mã đơn hàng</span>
            <span className="text-sm font-medium text-neutral-9">
              {typeof payment.orderId === 'string' 
                ? payment.orderId 
                : (payment.orderId as any)?._id?.toString() || String(payment.orderId || '')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-6">Phương thức</span>
            <span className="text-sm font-medium text-neutral-9">
              {getMethodLabel(payment.method)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-6">Số tiền</span>
            <span className="text-base font-bold text-primary-6">
              {formatPriceVND(payment.amount)}
            </span>
          </div>
          {payment.transactionId && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-6">Mã giao dịch</span>
              <span className="text-sm font-medium text-neutral-9 font-mono">
                {payment.transactionId}
              </span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="space-y-2 text-sm text-neutral-6">
          <p>Ngày tạo: {new Date(payment.createdAt).toLocaleString("vi-VN")}</p>
          {payment.paidAt && (
            <p>Ngày thanh toán: {new Date(payment.paidAt).toLocaleString("vi-VN")}</p>
          )}
          {payment.updatedAt !== payment.createdAt && (
            <p>Cập nhật lần cuối: {new Date(payment.updatedAt).toLocaleString("vi-VN")}</p>
          )}
        </div>
      </div>
    </Section>
  );
};

export default PaymentStatus;

