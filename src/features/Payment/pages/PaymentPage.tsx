import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Wallet } from "lucide-react";
import Page from "@/foundation/components/layout/Page";
import Section from "@/foundation/components/sections/Section";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import { PaymentStatus, QRCodeDisplay } from "../components";
import { usePayment } from "../hooks";
import { addToast } from "@/app/store/slices/toast";
import { useDispatch } from "react-redux";
import { userWalletApi } from "@/core/api/wallet";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { 
    paymentStatus, 
    isPaymentStatusLoading, 
    getPaymentStatus,
    paymentStatusError 
  } = usePayment();

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const getPaymentStatusRef = useRef(getPaymentStatus);
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Keep ref updated
  useEffect(() => {
    getPaymentStatusRef.current = getPaymentStatus;
  }, [getPaymentStatus]);

  // Load wallet balance if payment method is wallet
  useEffect(() => {
    const loadWalletBalance = async () => {
      if (paymentStatus?.method === "wallet") {
        try {
          const response = await userWalletApi.getBalance();
          if (response.success && response.data) {
            setWalletBalance(response.data.wallet?.balance || 0);
          }
        } catch (error) {
          console.error("Failed to load wallet balance:", error);
        }
      }
    };

    loadWalletBalance();
  }, [paymentStatus?.method]);

  useEffect(() => {
    if (!orderId) {
      navigate("/profile?tab=orders");
      return;
    }

    // Initial load
    getPaymentStatusRef.current(orderId);

    // Poll payment status every 5 seconds if pending/processing
    // Only poll if status is pending or processing
    const shouldPoll = () => {
      if (!paymentStatus) return true;
      return paymentStatus.status === "pending" || paymentStatus.status === "processing";
    };

    if (shouldPoll()) {
      pollingIntervalRef.current = setInterval(() => {
        if (orderId && shouldPoll()) {
          getPaymentStatusRef.current(orderId);
        }
      }, 5000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [orderId, navigate]); // Only depend on orderId and navigate

  // Stop polling when payment is completed, failed, or cancelled
  useEffect(() => {
    if (paymentStatus) {
      const finalStatuses = ["completed", "failed", "cancelled", "refunded"];
      if (finalStatuses.includes(paymentStatus.status)) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    }
  }, [paymentStatus]);

  // Handle successful payment
  useEffect(() => {
    if (paymentStatus?.status === "completed" && !hasShownSuccessToast) {
      setHasShownSuccessToast(true);
      dispatch(
        addToast({
          type: "success",
          message: "Thanh toán thành công!",
        })
      );
      // Redirect to orders after 3 seconds
      const timer = setTimeout(() => {
        navigate("/profile?tab=orders");
      }, 3000);
      setRedirectTimer(timer);
    }
  }, [paymentStatus, navigate, dispatch, hasShownSuccessToast]);

  const handleRefresh = () => {
    if (orderId) {
      getPaymentStatus(orderId);
    }
  };

  const handleBackToOrders = () => {
    navigate("/profile?tab=orders");
  };

  if (!orderId) {
    return null;
  }

  // Show error state
  if (paymentStatusError && !paymentStatus && !isPaymentStatusLoading) {
    return (
      <Page>
        <div className="min-h-screen bg-background-1">
          <div className="container mx-auto px-4 py-8 lg:py-12">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={handleBackToOrders}
              >
                Quay lại đơn hàng
              </Button>
            </div>
            <Section className="bg-error/10 rounded-2xl p-6 border border-error/20">
              <div className="flex flex-col items-center text-center">
                <AlertCircle className="w-16 h-16 text-error mb-4" />
                <h2 className="text-xl font-bold text-error mb-2">
                  Không tìm thấy thông tin thanh toán
                </h2>
                <p className="text-sm text-neutral-6 mb-4">
                  {paymentStatusError}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleBackToOrders}
                  >
                    Quay lại đơn hàng
                  </Button>
                  <Button
                    variant="solid"
                    size="md"
                    onClick={handleRefresh}
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </Page>
    );
  }

  // Determine if we should show QR/instructions
  const shouldShowPaymentInstructions = 
    paymentStatus && 
    (paymentStatus.status === "pending" || paymentStatus.status === "processing") &&
    (paymentStatus.method === "bank_transfer" || 
     paymentStatus.method === "vnpay" || 
     paymentStatus.method === "momo" || 
     paymentStatus.method === "zalopay");

  // Extract account info from instructions if available
  const extractAccountInfo = (instructions?: string) => {
    if (!instructions) return undefined;
    
    // Try to extract bank info from instructions
    const bankMatch = instructions.match(/(\w+):\s*(\d+)\s*-\s*([^\n]+)/);
    if (bankMatch) {
      return {
        bankName: bankMatch[1],
        accountNumber: bankMatch[2],
        accountHolder: bankMatch[3].trim(),
      };
    }
    return undefined;
  };

  const accountInfo = extractAccountInfo(paymentStatus?.instructions);

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
          ) : paymentStatus ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Status */}
              <div>
                <PaymentStatus
                  payment={paymentStatus}
                  isLoading={isPaymentStatusLoading}
                  onRefresh={handleRefresh}
                />
              </div>

              {/* Payment Instructions - Show for pending/processing payments */}
              {shouldShowPaymentInstructions && (
                <div>
                  <QRCodeDisplay
                    qrCode={paymentStatus.qrCode}
                    instructions={paymentStatus.instructions}
                    accountInfo={accountInfo}
                  />
                </div>
              )}

              {/* Success State */}
              {paymentStatus.status === "completed" && (
                <div className="lg:col-span-2">
                  <Section className="bg-success/10 rounded-2xl p-6 border border-success/20">
                    <div className="flex flex-col items-center text-center">
                      <CheckCircle2 className="w-16 h-16 text-success mb-4" />
                      <h2 className="text-2xl font-bold text-success mb-2">
                        Thanh toán thành công!
                      </h2>
                      <p className="text-sm text-neutral-6 mb-4">
                        Đơn hàng của bạn đã được thanh toán thành công. Bạn sẽ được chuyển đến trang đơn hàng trong giây lát...
                      </p>
                      <Button
                        color="green"
                        variant="solid"
                        size="md"
                        onClick={handleBackToOrders}
                      >
                        Xem đơn hàng ngay
                      </Button>
                    </div>
                  </Section>
                </div>
              )}

              {/* Failed State */}
              {paymentStatus.status === "failed" && (
                <div className="lg:col-span-2">
                  <Section className="bg-error/10 rounded-2xl p-6 border border-error/20">
                    <div className="flex flex-col items-center text-center">
                      <XCircle className="w-16 h-16 text-error mb-4" />
                      <h2 className="text-xl font-bold text-error mb-2">
                        Thanh toán thất bại
                      </h2>
                      <p className="text-sm text-neutral-6 mb-4">
                        Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          color="red"
                          variant="outline"
                          size="md"
                          onClick={handleBackToOrders}
                        >
                          Quay lại đơn hàng
                        </Button>
                        <Button
                          color="red"
                          variant="solid"
                          size="md"
                          onClick={handleRefresh}
                        >
                          Thử lại
                        </Button>
                      </div>
                    </div>
                  </Section>
                </div>
              )}

              {/* Cancelled State */}
              {paymentStatus.status === "cancelled" && (
                <div className="lg:col-span-2">
                  <Section className="bg-neutral-4/10 rounded-2xl p-6 border border-neutral-4/20">
                    <div className="flex flex-col items-center text-center">
                      <XCircle className="w-16 h-16 text-neutral-6 mb-4" />
                      <h2 className="text-xl font-bold text-neutral-9 mb-2">
                        Thanh toán đã bị hủy
                      </h2>
                      <p className="text-sm text-neutral-6 mb-4">
                        Giao dịch thanh toán đã bị hủy. Vui lòng thử lại nếu bạn muốn tiếp tục thanh toán.
                      </p>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={handleBackToOrders}
                      >
                        Quay lại đơn hàng
                      </Button>
                    </div>
                  </Section>
                </div>
              )}

              {/* Wallet Payment - Pending/Processing */}
              {paymentStatus.method === "wallet" && 
               (paymentStatus.status === "pending" || paymentStatus.status === "processing") && (
                <div className="lg:col-span-2">
                  <Section className="bg-primary-10 rounded-2xl p-6 border border-primary-4">
                    <div className="flex flex-col items-center text-center">
                      <Wallet className="w-16 h-16 text-primary-6 mb-4" />
                      <h2 className="text-xl font-bold text-primary-9 mb-2">
                        Đang xử lý thanh toán bằng ví
                      </h2>
                      <p className="text-sm text-neutral-6 mb-4">
                        Hệ thống đang xử lý thanh toán từ ví của bạn. Vui lòng đợi trong giây lát...
                      </p>
                      {walletBalance !== null && (
                        <div className="mb-4 p-3 bg-background-1 rounded-lg border border-border-1">
                          <p className="text-xs text-neutral-6 mb-1">Số dư ví hiện tại</p>
                          <p className="text-lg font-bold text-primary-6">
                            {formatPriceVND(walletBalance)}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="md"
                          onClick={handleBackToOrders}
                        >
                          Quay lại
                        </Button>
                        <Button
                          variant="solid"
                          size="md"
                          onClick={handleRefresh}
                          loading={isPaymentStatusLoading}
                        >
                          Làm mới
                        </Button>
                      </div>
                    </div>
                  </Section>
                </div>
              )}

              {/* Wallet Payment - Failed (Insufficient balance) */}
              {paymentStatus.method === "wallet" && paymentStatus.status === "failed" && (
                <div className="lg:col-span-2">
                  <Section className="bg-error/10 rounded-2xl p-6 border border-error/20">
                    <div className="flex flex-col items-center text-center">
                      <XCircle className="w-16 h-16 text-error mb-4" />
                      <h2 className="text-xl font-bold text-error mb-2">
                        Thanh toán thất bại
                      </h2>
                      <p className="text-sm text-neutral-6 mb-4">
                        Số dư ví không đủ để thanh toán đơn hàng này.
                      </p>
                      {walletBalance !== null && (
                        <div className="mb-4 p-3 bg-background-1 rounded-lg border border-border-1 w-full max-w-md">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-neutral-6">Số dư ví:</span>
                            <span className="text-sm font-semibold text-neutral-9">
                              {formatPriceVND(walletBalance)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-6">Số tiền cần thanh toán:</span>
                            <span className="text-sm font-semibold text-error">
                              {formatPriceVND(paymentStatus.amount)}
                            </span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-border-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-neutral-6">Cần nạp thêm:</span>
                              <span className="text-sm font-bold text-error">
                                {formatPriceVND(Math.max(0, paymentStatus.amount - walletBalance))}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="md"
                          onClick={handleBackToOrders}
                        >
                          Quay lại đơn hàng
                        </Button>
                        <Button
                          variant="solid"
                          size="md"
                          onClick={() => {
                            navigate(`/wallet/deposit?walletType=user&returnUrl=${encodeURIComponent(`/payment/${orderId}`)}`);
                          }}
                        >
                          Nạp tiền vào ví
                        </Button>
                      </div>
                    </div>
                  </Section>
                </div>
              )}

              {/* COD - No payment needed */}
              {paymentStatus.method === "cod" && paymentStatus.status === "pending" && (
                <div className="lg:col-span-2">
                  <Section className="bg-primary-10 rounded-2xl p-6 border border-primary-4">
                    <div className="flex flex-col items-center text-center">
                      <CheckCircle2 className="w-16 h-16 text-primary-6 mb-4" />
                      <h2 className="text-xl font-bold text-primary-9 mb-2">
                        Đơn hàng đã được tạo
                      </h2>
                      <p className="text-sm text-neutral-6 mb-4">
                        Bạn đã chọn thanh toán khi nhận hàng (COD). Vui lòng thanh toán khi nhận được sản phẩm.
                      </p>
                      <Button
                        variant="solid"
                        size="md"
                        onClick={handleBackToOrders}
                      >
                        Xem đơn hàng
                      </Button>
                    </div>
                  </Section>
                </div>
              )}
            </div>
          ) : (
            <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
              <div className="text-center py-8">
                <p className="text-sm text-neutral-6 mb-4">
                  Không tìm thấy thông tin thanh toán
                </p>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleRefresh}
                >
                  Tải lại
                </Button>
              </div>
            </Section>
          )}
        </div>
      </div>
    </Page>
  );
};

export default PaymentPage;

