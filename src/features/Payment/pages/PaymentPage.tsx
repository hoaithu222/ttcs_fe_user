import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, XCircle } from "lucide-react";
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
import AlertMessage from "@/foundation/components/info/AlertMessage";
import ScrollView from "@/foundation/components/scroll/ScrollView";
import { useSuccessModal } from "@/shared/contexts/SuccessModalContext";
import { useSocketRefresh } from "@/shared/contexts/SocketRefreshContext";

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccessModal } = useSuccessModal();
  const { subscribePaymentRefresh } = useSocketRefresh();

  const { 
    paymentStatus, 
    isPaymentStatusLoading, 
    getPaymentStatus,
    paymentStatusError 
  } = usePayment();
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

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

  // Load payment status once when vào trang hoặc đổi orderId
  // Reset hasShownSuccessToast khi orderId thay đổi để tránh redirect sớm
  useEffect(() => {
    if (!orderId) {
      navigate("/profile?tab=orders");
      return;
    }
    // Reset success toast flag khi orderId thay đổi
    setHasShownSuccessToast(false);
    // Clear redirect timer nếu có
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
    // Load payment status mới
    getPaymentStatus(orderId);
  }, [orderId, navigate, getPaymentStatus]);

  // Subscribe to socket refresh events for this orderId
  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = subscribePaymentRefresh(orderId, () => {
      console.log("[PaymentPage] Socket refresh triggered for orderId:", orderId);
      getPaymentStatus(orderId);
    });

    return unsubscribe;
  }, [orderId, subscribePaymentRefresh, getPaymentStatus]);

  // Dọn redirect timer khi unmount
  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [redirectTimer]);

  // Handle successful payment - chỉ redirect khi payment đã completed và không phải đang loading
  useEffect(() => {
    if (
      paymentStatus?.status === "completed" && 
      !hasShownSuccessToast &&
      !isPaymentStatusLoading
    ) {
      setHasShownSuccessToast(true);
      
      // Hiển thị success modal (fallback nếu socket không hoạt động)
      showSuccessModal({
        type: "payment",
        title: "Thanh toán thành công!",
        message: `Đơn hàng #${orderId?.slice(-6).toUpperCase()} đã được thanh toán thành công.`,
        confirmText: "Xem đơn hàng",
        actionUrl: orderId ? `/payment/result/${orderId}` : "/profile?tab=orders",
        onConfirm: () => {
          if (orderId) {
            navigate(`/payment/result/${orderId}`);
          } else {
            navigate("/profile?tab=orders");
          }
        },
      });

      dispatch(
        addToast({
          type: "success",
          message: "Thanh toán thành công!",
        })
      );
      // Redirect to trang cảm ơn sau 3 giây (nếu user không click vào modal)
      const timer = setTimeout(() => {
        if (orderId) {
          navigate(`/payment/result/${orderId}`);
        } else {
          navigate("/profile?tab=orders");
        }
      }, 5000);
      setRedirectTimer(timer);
    }
  }, [paymentStatus, navigate, dispatch, hasShownSuccessToast, isPaymentStatusLoading, orderId, showSuccessModal]);

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
        <div className="min-h-screen bg-background-base">
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
            <AlertMessage
              type="error"
              title="Không tìm thấy thông tin thanh toán"
              message={paymentStatusError}
              action={
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleBackToOrders}>
                    Quay lại đơn hàng
                  </Button>
                  <Button variant="solid" size="sm" onClick={handleRefresh}>
                    Thử lại
                  </Button>
                </div>
              }
            />
          </div>
        </div>
      </Page>
    );
  }

  // Determine if we should show QR/instructions
  // Hiển thị QR khi: payment status là pending/processing và method là bank_transfer
  const shouldShowPaymentInstructions = 
    paymentStatus && 
    (paymentStatus.status === "pending" || paymentStatus.status === "processing") &&
    paymentStatus.method === "bank_transfer";

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
  const QR_EXPIRES_IN_MINUTES = 10;

  return (
    <Page>
      <div className="min-h-[calc(100vh-80px)] px-4 bg-background-base">
        <ScrollView className="min-h-[calc(100vh-80px)] bg-background-base">
        <div className=" px-8 py-8 lg:py-12 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={handleBackToOrders}
              >
                Quay lại đơn hàng
              </Button>
             
            </div>
          </div>

          {isPaymentStatusLoading && !paymentStatus ? (
            <div className="flex items-center justify-center py-12">
              <Loading layout="centered" message="Đang tải thông tin thanh toán..." />
            </div>
          ) : paymentStatus ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Payment Status */}
              <div className="lg:col-span-1">
                <PaymentStatus
                  payment={paymentStatus}
                  isLoading={isPaymentStatusLoading}
                  onRefresh={handleRefresh}
                />
              </div>

              {/* Payment Instructions - Show for pending/processing payments */}
              {shouldShowPaymentInstructions && (
                <div className="lg:col-span-2 space-y-4">
                  <Section className="bg-background-1 rounded-2xl p-6 border border-border-1 shadow-sm space-y-4">
                    
                    <AlertMessage
                      type="info"
                      title="Chuyển khoản qua ngân hàng (Sepay)"
                      message={
                        <>
                          Mã QR này được tạo riêng cho đơn hàng của bạn. Vui lòng không chia sẻ cho
                          người khác để đảm bảo an toàn.
                        </>
                      }
                      compact
                    />
                    {paymentStatus.qrCode ? (
                      <QRCodeDisplay
                        qrCode={paymentStatus.qrCode}
                        instructions={paymentStatus.instructions}
                        accountInfo={accountInfo}
                        expiresInMinutes={QR_EXPIRES_IN_MINUTES}
                        onRefresh={handleRefresh}
                        isRefreshing={isPaymentStatusLoading}
                      />
                    ) : (
                      <AlertMessage
                        type="warning"
                        title="Đang tạo mã QR..."
                        message="Hệ thống đang tạo mã QR cho bạn. Vui lòng đợi trong giây lát hoặc nhấn nút làm mới."
                        action={
                          <Button
                            variant="solid"
                            size="sm"
                            onClick={handleRefresh}
                            loading={isPaymentStatusLoading}
                          >
                            Làm mới
                          </Button>
                        }
                      />
                    )}
                  </Section>
                </div>
              )}

              {/* Fallback: Hiển thị thông báo khi payment method là bank_transfer nhưng chưa có QR hoặc status không đúng */}
              {paymentStatus && 
               paymentStatus.method === "bank_transfer" &&
               !shouldShowPaymentInstructions && 
               paymentStatus.status !== "completed" && 
               paymentStatus.status !== "failed" && 
               paymentStatus.status !== "cancelled" && (
                <div className="lg:col-span-2">
                  <AlertMessage
                    type="info"
                    title="Đang xử lý thanh toán"
                    message="Hệ thống đang chuẩn bị thông tin thanh toán cho bạn. Vui lòng đợi trong giây lát."
                    action={
                      <Button
                        variant="solid"
                        size="sm"
                        onClick={handleRefresh}
                        loading={isPaymentStatusLoading}
                      >
                        Làm mới
                      </Button>
                    }
                  />
                </div>
              )}

              {/* Fallback: Hiển thị thông báo khi payment method là bank_transfer nhưng chưa có QR */}
              {paymentStatus && 
               paymentStatus.method === "bank_transfer" &&
               (paymentStatus.status === "pending" || paymentStatus.status === "processing") &&
               !shouldShowPaymentInstructions && (
                <div className="lg:col-span-2">
                  <AlertMessage
                    type="info"
                    title="Đang xử lý thanh toán"
                    message="Hệ thống đang chuẩn bị thông tin thanh toán cho bạn. Vui lòng đợi trong giây lát."
                    action={
                      <Button
                        variant="solid"
                        size="sm"
                        onClick={handleRefresh}
                        loading={isPaymentStatusLoading}
                      >
                        Làm mới
                      </Button>
                    }
                  />
                </div>
              )}

              {/* Success State */}
              {paymentStatus.status === "completed" && (
                <div className="lg:col-span-2">
                  <AlertMessage
                    type="success"
                    title="Thanh toán thành công!"
                    message="Đơn hàng của bạn đã được thanh toán thành công. Bạn sẽ được chuyển đến trang đơn hàng trong giây lát..."
                    action={
                      <Button
                        color="green"
                        variant="solid"
                        size="sm"
                        onClick={handleBackToOrders}
                      >
                        Xem đơn hàng ngay
                      </Button>
                    }
                  />
                </div>
              )}

              {/* Failed State */}
              {paymentStatus.status === "failed" && (
                <div className="lg:col-span-2">
                  <AlertMessage
                    type="error"
                    title="Thanh toán thất bại"
                    message="Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."
                    action={
                      <div className="flex gap-2">
                        <Button
                          color="red"
                          variant="outline"
                          size="sm"
                          onClick={handleBackToOrders}
                        >
                          Quay lại đơn hàng
                        </Button>
                        <Button
                          color="red"
                          variant="solid"
                          size="sm"
                          onClick={handleRefresh}
                        >
                          Thử lại
                        </Button>
                      </div>
                    }
                  />
                </div>
              )}

              {/* Cancelled State */}
              {paymentStatus.status === "cancelled" && (
                <div className="lg:col-span-2">
                  <AlertMessage
                    type="info"
                    title="Thanh toán đã bị hủy"
                    message="Giao dịch thanh toán đã bị hủy. Vui lòng thử lại nếu bạn muốn tiếp tục thanh toán."
                    action={
                      <Button variant="outline" size="sm" onClick={handleBackToOrders}>
                        Quay lại đơn hàng
                      </Button>
                    }
                  />
                </div>
              )}

              {/* Wallet Payment - Pending/Processing */}
              {paymentStatus.method === "wallet" && 
               (paymentStatus.status === "pending" || paymentStatus.status === "processing") && (
                <div className="lg:col-span-2">
                  <AlertMessage
                    type="info"
                    title="Đang xử lý thanh toán bằng ví"
                    message={
                      <>
                        Hệ thống đang xử lý thanh toán từ ví của bạn. Vui lòng đợi trong giây lát.
                        {walletBalance !== null && (
                          <div className="mt-2 text-xs text-neutral-6">
                            Số dư ví hiện tại:{" "}
                            <span className="font-semibold text-primary-6">
                              {formatPriceVND(walletBalance)}
                            </span>
                          </div>
                        )}
                      </>
                    }
                    action={
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleBackToOrders}>
                          Quay lại
                        </Button>
                        <Button
                          variant="solid"
                          size="sm"
                          onClick={handleRefresh}
                          loading={isPaymentStatusLoading}
                        >
                          Làm mới
                        </Button>
                      </div>
                    }
                  />
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
                  <AlertMessage
                    type="success"
                    title="Đơn hàng đã được tạo"
                    message="Bạn đã chọn thanh toán khi nhận hàng (COD). Vui lòng thanh toán khi nhận được sản phẩm."
                    action={
                      <Button variant="solid" size="sm" onClick={handleBackToOrders}>
                        Xem đơn hàng
                      </Button>
                    }
                  />
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
        </ScrollView>
      </div>
    </Page>
  );
};

export default PaymentPage;

