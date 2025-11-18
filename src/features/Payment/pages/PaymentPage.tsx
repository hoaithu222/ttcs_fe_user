import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Page from "@/foundation/components/layout/Page";
import Section from "@/foundation/components/sections/Section";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import { PaymentStatus, QRCodeDisplay } from "../components";
import { usePayment } from "../hooks";
import { addToast } from "@/app/store/slices/toast";
import { useDispatch } from "react-redux";

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { paymentStatus, isPaymentStatusLoading, getPaymentStatus } = usePayment();

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const getPaymentStatusRef = useRef(getPaymentStatus);

  // Keep ref updated
  useEffect(() => {
    getPaymentStatusRef.current = getPaymentStatus;
  }, [getPaymentStatus]);

  useEffect(() => {
    if (!orderId) {
      navigate("/profile/orders");
      return;
    }

    // Initial load
    getPaymentStatusRef.current(orderId);

    // Poll payment status every 5 seconds if pending/processing
    pollingIntervalRef.current = setInterval(() => {
      if (orderId) {
        getPaymentStatusRef.current(orderId);
      }
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [orderId, navigate]); // Removed getPaymentStatus from dependencies

  // Stop polling when payment is completed or failed
  useEffect(() => {
    if (paymentStatus) {
      if (paymentStatus.status === "completed" || paymentStatus.status === "failed" || paymentStatus.status === "cancelled") {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    }
  }, [paymentStatus]);

  // Handle successful payment
  useEffect(() => {
    if (paymentStatus?.status === "completed") {
      dispatch(
        addToast({
          type: "success",
          message: "Thanh toán thành công!",
        })
      );
      // Redirect to orders after 2 seconds
      setTimeout(() => {
        navigate("/profile/orders");
      }, 2000);
    }
  }, [paymentStatus, navigate, dispatch]);

  const handleRefresh = () => {
    if (orderId) {
      getPaymentStatus(orderId);
    }
  };

  const handleBackToOrders = () => {
    navigate("/profile/orders");
  };

  if (!orderId) {
    return null;
  }

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
              onClick={handleBackToOrders}
            >
              Quay lại đơn hàng
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-neutral-9">Thanh toán đơn hàng</h1>
              <p className="text-sm text-neutral-6">Mã đơn hàng: {orderId}</p>
            </div>
          </div>

          {isPaymentStatusLoading && !paymentStatus ? (
            <div className="flex items-center justify-center py-12">
              <Loading layout="centered" message="Đang tải thông tin thanh toán..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Status */}
              <div>
                <PaymentStatus
                  payment={paymentStatus}
                  isLoading={isPaymentStatusLoading}
                  onRefresh={handleRefresh}
                />
              </div>

              {/* Payment Instructions */}
              {paymentStatus && paymentStatus.instructions && (
                <div>
                  <QRCodeDisplay
                    qrCode={paymentStatus.qrCode}
                    instructions={paymentStatus.instructions}
                  />

                  {paymentStatus.status === "completed" && (
                    <Section className="bg-success/10 rounded-2xl p-6 border border-success/20">
                      <div className="flex flex-col items-center text-center">
                        <CheckCircle2 className="w-16 h-16 text-success mb-4" />
                        <h2 className="text-2xl font-bold text-success mb-2">
                          Thanh toán thành công!
                        </h2>
                        <p className="text-sm text-neutral-6 mb-4">
                          Đơn hàng của bạn đã được thanh toán thành công.
                        </p>
                        <Button
                          color="green"
                          variant="solid"
                          size="md"
                          onClick={handleBackToOrders}
                        >
                          Xem đơn hàng
                        </Button>
                      </div>
                    </Section>
                  )}

                  {paymentStatus.status === "failed" && (
                    <Section className="bg-error/10 rounded-2xl p-6 border border-error/20">
                      <div className="flex flex-col items-center text-center">
                        <h2 className="text-xl font-bold text-error mb-2">
                          Thanh toán thất bại
                        </h2>
                        <p className="text-sm text-neutral-6 mb-4">
                          Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
                        </p>
                        <Button
                          color="red"
                          variant="outline"
                          size="md"
                          onClick={handleBackToOrders}
                        >
                          Quay lại đơn hàng
                        </Button>
                      </div>
                    </Section>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default PaymentPage;

