import React from "react";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import type { Payment } from "@/core/api/payments/type";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Loading from "@/foundation/components/loading/Loading";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";

interface PaymentHistoryProps {
  payments: Payment[];
  isLoading?: boolean;
  onPaymentClick?: (payment: Payment) => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  isLoading = false,
  onPaymentClick,
}) => {
  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "failed":
      case "cancelled":
        return <XCircle className="w-5 h-5 text-error" />;
      case "processing":
        return <Loader2 className="w-5 h-5 animate-spin text-primary-6" />;
      case "pending":
      default:
        return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusLabel = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "Đã thanh toán";
      case "processing":
        return "Đang xử lý";
      case "failed":
        return "Thất bại";
      case "cancelled":
        return "Đã hủy";
      case "refunded":
        return "Đã hoàn tiền";
      case "pending":
      default:
        return "Đang chờ";
    }
  };

  const getMethodLabel = (method: Payment["method"]) => {
    switch (method) {
      case "cod":
        return "COD";
      case "bank_transfer":
        return "Chuyển khoản qua ngân hàng (Sepay)";
      case "wallet":
        return "Thanh toán bằng ví";
      default:
        return method;
    }
  };

  if (isLoading) {
    return (
      <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
        <SectionTitle className="mb-4">Lịch sử thanh toán</SectionTitle>
        <Loading layout="centered" message="Đang tải..." />
      </Section>
    );
  }

  if (payments.length === 0) {
    return (
      <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
        <SectionTitle className="mb-4">Lịch sử thanh toán</SectionTitle>
        <p className="text-sm text-neutral-6 text-center py-8">
          Bạn chưa có giao dịch thanh toán nào
        </p>
      </Section>
    );
  }

  return (
    <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
      <SectionTitle className="mb-4">Lịch sử thanh toán</SectionTitle>
      <div className="space-y-3">
        {payments.map((payment) => (
          <button
            key={payment._id}
            type="button"
            onClick={() => onPaymentClick?.(payment)}
            className="w-full p-4 bg-background-1 rounded-lg border border-border-1 hover:border-primary-4 hover:bg-primary-10/50 transition-all duration-200 text-left"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(payment.status)}
                  <span className="text-sm font-medium text-neutral-9">
                    {getStatusLabel(payment.status)}
                  </span>
                </div>
                <p className="text-xs text-neutral-6 mb-1">
                  Đơn hàng: {typeof payment.orderId === 'string' 
                    ? payment.orderId 
                    : (payment.orderId as any)?._id?.toString() || String(payment.orderId || '')}
                </p>
                <p className="text-xs text-neutral-6">
                  {getMethodLabel(payment.method)} •{" "}
                  {new Date(payment.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-primary-6">
                  {formatPriceVND(payment.amount)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Section>
  );
};

export default PaymentHistory;

