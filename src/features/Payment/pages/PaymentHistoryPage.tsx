import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { History, ArrowLeft } from "lucide-react";
import Page from "@/foundation/components/layout/Page";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import { PaymentHistory } from "../components";
import { usePayment } from "../hooks";
import type { Payment } from "@/core/api/payments/type";

const PaymentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    paymentHistory,
    paymentHistoryPagination,
    isPaymentHistoryLoading,
    getPaymentHistory,
  } = usePayment();

  const [currentPage, setCurrentPage] = useState(1);
  const getPaymentHistoryRef = useRef(getPaymentHistory);

  // Keep ref updated
  useEffect(() => {
    getPaymentHistoryRef.current = getPaymentHistory;
  }, [getPaymentHistory]);

  useEffect(() => {
    getPaymentHistoryRef.current({ page: currentPage, limit: 10 });
  }, [currentPage]); // Only depend on currentPage

  const handlePaymentClick = (payment: Payment) => {
    navigate(`/payment/${payment.orderId}`);
  };

  const handleLoadMore = () => {
    if (
      paymentHistoryPagination &&
      currentPage < paymentHistoryPagination.totalPages
    ) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <Page>
      <div className="min-h-screen bg-background-1">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate("/profile?tab=orders")}
            >
              Quay lại
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary-6">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-9">Lịch sử thanh toán</h1>
                <p className="text-sm text-neutral-6">
                  {paymentHistoryPagination?.total || 0} giao dịch
                </p>
              </div>
            </div>
          </div>

          {/* Helper info */}
          <div className="mb-4">
            <AlertMessage
              type="info"
              compact
              message="Chạm vào một giao dịch để xem lại chi tiết thanh toán và trạng thái mới nhất."
            />
          </div>

          {/* Payment History */}
          <PaymentHistory
            payments={paymentHistory}
            isLoading={isPaymentHistoryLoading}
            onPaymentClick={handlePaymentClick}
          />

          {/* Load More */}
          {paymentHistoryPagination &&
            currentPage < paymentHistoryPagination.totalPages && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleLoadMore}
                  disabled={isPaymentHistoryLoading}
                  loading={isPaymentHistoryLoading}
                >
                  Tải thêm
                </Button>
              </div>
            )}

          {/* Pagination Info */}
          {paymentHistoryPagination && (
            <div className="mt-4 text-center text-sm text-neutral-6">
              Trang {paymentHistoryPagination.page} / {paymentHistoryPagination.totalPages}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default PaymentHistoryPage;

