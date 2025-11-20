import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/foundation/components/info/Card";
import Section from "@/foundation/components/sections/Section";
import { useProfileOrders } from "../../hooks/useOrder";
import Button from "@/foundation/components/buttons/Button";
import { userOrdersApi } from "@/core/api/orders";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import { ReduxStateType } from "@/app/store/types";
import ConfirmModal from "@/foundation/components/modal/ModalConfirm";
import Modal from "@/foundation/components/modal/Modal";
import { usePayment } from "@/features/Payment/hooks";
import { useDispatch } from "react-redux";
import { addToast } from "@/app/store/slices/toast";
import { CreditCard, Wallet, Building2, Truck, Package, Store } from "lucide-react";
import type { PaymentMethod } from "@/core/api/payments/type";
import { userWalletApi } from "@/core/api/wallet";

const OrdersPanel = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders, status, loadOrders } = useProfileOrders();
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "awaiting_payment"
  >("all");
  
  // Payment method selection modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<{ orderId: string; totalAmount: number } | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  
  const {
    paymentMethods,
    isPaymentMethodsLoading,
    getPaymentMethods,
    checkoutData,
    isCheckoutLoading,
    createCheckout,
  } = usePayment();

  useEffect(() => {
    loadOrders(1, 10);
  }, [loadOrders]);

  console.log("checkoutData", orders);

  // Load payment methods when modal opens
  useEffect(() => {
    if (isPaymentModalOpen) {
      getPaymentMethods();
      loadWalletBalance();
    }
  }, [isPaymentModalOpen, getPaymentMethods]);

  // Load wallet balance
  const loadWalletBalance = async () => {
    try {
      const response = await userWalletApi.getBalance();
      if (response.success && response.data) {
        setWalletBalance(response.data.wallet?.balance || 0);
      }
    } catch (error) {
      console.error("Failed to load wallet balance:", error);
    }
  };

  // Handle payment button click
  const handlePaymentClick = useCallback((order: any) => {
    setSelectedOrderForPayment({
      orderId: order._id,
      totalAmount: order.totalAmount || 0,
    });
    setSelectedPaymentMethod("");
    setIsPaymentModalOpen(true);
  }, []);

  // Handle payment method selection and checkout
  const handleConfirmPayment = useCallback(async () => {
    if (!selectedOrderForPayment || !selectedPaymentMethod) {
      dispatch(addToast({ type: "error", message: "Vui lòng chọn phương thức thanh toán" }));
      return;
    }

    const selectedMethod = paymentMethods.find((m) => m.id === selectedPaymentMethod);
    if (!selectedMethod) {
      dispatch(addToast({ type: "error", message: "Phương thức thanh toán không hợp lệ" }));
      return;
    }

    // Check wallet balance if wallet method is selected
    if (selectedMethod.type === "wallet") {
      if (walletBalance === null) {
        await loadWalletBalance();
      }
      if (walletBalance !== null && walletBalance < selectedOrderForPayment.totalAmount) {
        dispatch(
          addToast({
            type: "error",
            message: `Số dư ví không đủ. Số dư hiện tại: ${formatPriceVND(walletBalance)}. Vui lòng nạp thêm tiền.`,
          })
        );
        setIsPaymentModalOpen(false);
        navigate(`/wallet/deposit?walletType=user&returnUrl=${encodeURIComponent(`/profile?tab=orders`)}`);
        return;
      }
    }

    // Create checkout
    createCheckout(selectedOrderForPayment.orderId, selectedPaymentMethod);
  }, [selectedOrderForPayment, selectedPaymentMethod, paymentMethods, walletBalance, createCheckout, dispatch, navigate]);

  // Navigate to payment page when checkout is created
  useEffect(() => {
    if (checkoutData?.paymentId && selectedOrderForPayment) {
      const paymentUrl = checkoutData.paymentUrl;
      
      // Check if paymentUrl is an external gateway URL
      const isExternalGateway = paymentUrl && 
        (paymentUrl.includes('vnpayment.vn') ||
         paymentUrl.includes('momo.vn') ||
         paymentUrl.includes('zalopay.vn') ||
         paymentUrl.includes('paypal.com') ||
         paymentUrl.includes('sandbox.vnpayment.vn'));
      
      setIsPaymentModalOpen(false);
      setSelectedOrderForPayment(null);
      setSelectedPaymentMethod("");

      if (isExternalGateway && paymentUrl) {
        // Redirect to external payment gateway
        window.location.href = paymentUrl;
      } else {
        // Navigate to frontend payment page
        navigate(`/payment/${selectedOrderForPayment.orderId}`);
      }
    }
  }, [checkoutData, selectedOrderForPayment, navigate]);

  const handleCancel = useCallback(
    (orderId: string) => {
      if (cancelingId) return;
      setOrderToCancel(orderId);
    },
    [cancelingId]
  );

  const confirmCancelOrder = useCallback(async () => {
    if (!orderToCancel) return;
    try {
      setCancelingId(orderToCancel);
      await userOrdersApi.cancelOrder(orderToCancel);
      loadOrders(1, 10);
    } finally {
      setCancelingId(null);
      setOrderToCancel(null);
    }
  }, [orderToCancel, loadOrders]);

  const closeCancelModal = useCallback(() => {
    if (cancelingId) return;
    setOrderToCancel(null);
  }, [cancelingId]);

  const shippingStatusMap = useMemo(
    () => ({
      pending: { label: "Đang chờ xử lý", className: "bg-warning/15 text-warning" },
      processing: { label: "Đang chuẩn bị", className: "bg-primary-10 text-primary-6" },
      shipped: { label: "Đang vận chuyển", className: "bg-blue-100 text-blue-600" },
      delivered: { label: "Đã giao", className: "bg-success/10 text-success" },
      cancelled: { label: "Đã hủy", className: "bg-error/10 text-error" },
    }),
    []
  );

  const paymentStatusMap = useMemo(
    () => ({
      pending: { label: "Chưa thanh toán", className: "bg-warning/15 text-warning" },
      processing: { label: "Đang thanh toán", className: "bg-primary-10 text-primary-6" },
      completed: { label: "Đã thanh toán", className: "bg-success/10 text-success" },
      failed: { label: "Thanh toán thất bại", className: "bg-error/10 text-error" },
      cancelled: { label: "Đã hủy thanh toán", className: "bg-neutral-2 text-neutral-6" },
      refunded: { label: "Đã hoàn tiền", className: "bg-blue-100 text-blue-600" },
    }),
    []
  );

  const renderBadge = (text: string, className: string) => (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {text}
    </span>
  );

  const tabs = useMemo(
    () => [
      { key: "all", label: "Tất cả" },
      { key: "awaiting_payment", label: "Chờ thanh toán" },
      { key: "pending", label: "Chờ xác nhận" },
      { key: "processing", label: "Đang xử lý" },
      { key: "shipped", label: "Đang vận chuyển" },
      { key: "delivered", label: "Đã giao" },
      { key: "cancelled", label: "Đã hủy" },
    ],
    []
  );

  const filteredOrders = useMemo(() => {
    if (!orders || !orders.length) return [];
    if (activeTab === "all") return orders;
    if (activeTab === "awaiting_payment") {
      return orders.filter(
        (order: any) => !(order.isPay || order.paymentStatus === "completed")
      );
    }
    return orders.filter((order: any) => (order.orderStatus || order.status) === activeTab);
  }, [orders, activeTab]);

  const countsByTab = useMemo(() => {
    const counts: Record<string, number> = {
      all: orders?.length || 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      awaiting_payment: 0,
    };
    (orders || []).forEach((order: any) => {
      const state = order.orderStatus || order.status || "pending";
      counts[state] = (counts[state] || 0) + 1;
      if (!(order.isPay || order.paymentStatus === "completed")) {
        counts.awaiting_payment += 1;
      }
    });
    return counts;
  }, [orders]);

  const isLoading = status === ReduxStateType.LOADING;
  const hasOrders = filteredOrders && filteredOrders.length > 0;

  return (
    <Section title="Đơn hàng của tôi" className="max-h-[calc(100vh-100px)] overflow-y-auto">
      <Card className="space-y-4 bg-background-1 hidden-scrollbar *:max-h-[calc(100vh-100px)] overflow-y-auto">
        {!isLoading && (
          <div className="flex flex-row flex-wrap gap-2 border-b border-border-2 pb-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = countsByTab[tab.key] || 0;
              const hasCount = count > 0;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary-6 text-white shadow-md"
                      : "bg-neutral-2 text-neutral-7 hover:bg-neutral-3"
                  }`}
                >
                  {tab.label}
                  {hasCount && <span className="ml-1 text-xs opacity-80">({count})</span>}
                </button>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <div className="py-6">
            <Loading layout="centered" message="Đang tải đơn hàng..." />
          </div>
        ) : hasOrders ? (
          <div className="space-y-3 pt-1">
            {filteredOrders.map((order: any) => {
            const shippingStatus =
              (order.orderStatus || order.status || "pending") as keyof typeof shippingStatusMap;
            const paymentStatus = (
              order.paymentStatus || (order.isPay ? "completed" : "pending")
            ) as keyof typeof paymentStatusMap;
            const shippingInfo =
              shippingStatusMap[shippingStatus] || shippingStatusMap.pending;
            const paymentInfo =
              paymentStatusMap[paymentStatus] || paymentStatusMap.pending;
            const awaitingPayment =
              paymentStatus === "pending" || paymentStatus === "processing";

            // Get shop info
            const shopInfo = typeof order.shopId === "object" ? order.shopId : null;
            const shopName = shopInfo?.name || "Cửa hàng";
            const shopLogo = shopInfo?.logo || "";

            // Get order items with product info
            const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];
            
            return (
              <div key={order._id} className="border rounded-xl bg-background-2 border-border-2 overflow-hidden">
                {/* Shop Header */}
                <div className="px-4 py-3 bg-background-1 border-b border-border-2 flex items-center gap-3">
                  {shopLogo ? (
                    <img
                      src={shopLogo}
                      alt={shopName}
                      className="w-8 h-8 rounded-full object-cover border border-border-1 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-10 flex items-center justify-center flex-shrink-0">
                      <Store className="w-4 h-4 text-primary-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-9 truncate">{shopName}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {renderBadge(shippingInfo.label, shippingInfo.className)}
                    {renderBadge(paymentInfo.label, paymentInfo.className)}
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-4 space-y-4">
                  {/* Order Items */}
                  {orderItems.length > 0 ? (
                    <div className="space-y-3">
                      {orderItems.map((item: any) => {
                        const productInfo = typeof item.productId === "object" ? item.productId : null;
                        const productName = productInfo?.name || "Sản phẩm";
                        const productImages = productInfo?.images || [];
                        // Handle images: can be array of IDs (string) or populated objects with url
                        let productImage = "";
                        if (Array.isArray(productImages) && productImages.length > 0) {
                          const firstImage = productImages[0];
                          if (typeof firstImage === "string") {
                            // If it's just an ID, we can't use it directly
                            productImage = "";
                          } else if (typeof firstImage === "object" && firstImage?.url) {
                            // If it's populated with url
                            productImage = firstImage.url;
                          }
                        }

                        return (
                          <div key={item._id || Math.random()} className="flex gap-3 p-3 bg-background-1 rounded-lg border border-border-1">
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={productName}
                                className="w-16 h-16 rounded object-cover border border-border-1 flex-shrink-0"
                              />
                            ) : (
                              <div className="flex justify-center items-center w-16 h-16 rounded bg-neutral-2 border border-border-1 flex-shrink-0">
                                <Package className="w-6 h-6 text-neutral-4" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-9 line-clamp-2 mb-1">
                                {productName}
                              </p>
                              <div className="flex items-center justify-between text-xs text-neutral-6">
                                <span>Số lượng: {item.quantity || 1}</span>
                                <span className="font-semibold text-neutral-9">
                                  {formatPriceVND(item.totalPrice || item.price * (item.quantity || 1))}
                                </span>
                              </div>
                              {item.price && (
                                <p className="text-xs text-neutral-5 mt-1">
                                  {formatPriceVND(item.price)} / sản phẩm
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-6 text-center py-4">
                      Không có thông tin sản phẩm
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="pt-3 border-t border-border-1 space-y-2">
                    <div className="flex items-center justify-between text-xs text-neutral-6">
                      <span>Mã đơn:</span>
                      <span className="font-medium text-neutral-9">
                        {order.code || `#${order._id.slice(-6)}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-6">
                      <span>Ngày đặt:</span>
                      <span className="text-neutral-9">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("vi-VN")
                          : "--"}
                      </span>
                    </div>
                    {order.discountAmount && order.discountAmount > 0 && (
                      <div className="flex items-center justify-between text-xs text-neutral-6">
                        <span>Giảm giá:</span>
                        <span className="text-success">-{formatPriceVND(order.discountAmount)}</span>
                      </div>
                    )}
                    {order.shippingFee !== undefined && order.shippingFee > 0 && (
                      <div className="flex items-center justify-between text-xs text-neutral-6">
                        <span>Phí vận chuyển:</span>
                        <span className="text-neutral-9">{formatPriceVND(order.shippingFee)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-border-1">
                      <span className="text-sm font-medium text-neutral-7">Tổng tiền:</span>
                      <span className="text-lg font-bold text-primary-6">
                        {formatPriceVND(order.totalAmount || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Warning */}
                  {awaitingPayment && (
                    <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
                      Đơn hàng đang chờ thanh toán. Bạn có thể thanh toán ngay để shop xử lý nhanh hơn.
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 justify-end pt-2">
                    {awaitingPayment && (
                      <Button
                        color="blue"
                        size="sm"
                        onClick={() => handlePaymentClick(order)}
                      >
                        Thanh toán ngay
                      </Button>
                    )}
                    {(shippingStatus === "pending" || shippingStatus === "processing") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(order._id)}
                        disabled={cancelingId === order._id}
                      >
                        {cancelingId === order._id ? "Đang hủy..." : "Hủy đơn hàng"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        ) : (
          <Empty
            variant="data"
            title={
              countsByTab[activeTab] && activeTab !== "all"
                ? "Không có đơn nào trong trạng thái này"
                : "Chưa có đơn hàng"
            }
            description={
              countsByTab[activeTab] && activeTab !== "all"
                ? "Hãy tiếp tục mua sắm hoặc chọn tab khác để xem đơn hàng."
                : "Bạn chưa có đơn hàng nào. Hãy tiếp tục mua sắm để trải nghiệm dịch vụ."
            }
          />
        )}
      </Card>
      <ConfirmModal
        open={!!orderToCancel}
        onOpenChange={(open) => !open && closeCancelModal()}
        title="Hủy đơn hàng"
        content="Bạn có chắc muốn hủy đơn hàng này? Hành động này không thể hoàn tác."
        confirmText="Hủy đơn"
        cancelText="Giữ lại"
        iconType="warning"
        onConfirm={confirmCancelOrder}
        onCancel={closeCancelModal}
        disabled={!!cancelingId}
      />

      {/* Payment Method Selection Modal */}
      <Modal
        open={isPaymentModalOpen}
        onOpenChange={(open) => {
          if (!open && !isCheckoutLoading) {
            setIsPaymentModalOpen(false);
            setSelectedOrderForPayment(null);
            setSelectedPaymentMethod("");
          }
        }}
        title="Chọn phương thức thanh toán"
        size="lg"
        hideFooter
      >
        {selectedOrderForPayment && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="p-4 bg-background-2 rounded-lg border border-border-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-6">Mã đơn hàng</span>
                <span className="text-sm font-semibold text-neutral-9">
                  #{selectedOrderForPayment.orderId.slice(-6)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-6">Tổng tiền</span>
                <span className="text-lg font-bold text-primary-6">
                  {formatPriceVND(selectedOrderForPayment.totalAmount)}
                </span>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="text-base font-semibold text-neutral-9 mb-4">
                Phương thức thanh toán
              </h3>
              {isPaymentMethodsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-neutral-2 animate-pulse rounded-lg border border-border-1"
                    />
                  ))}
                </div>
              ) : paymentMethods.filter((m) => m.isActive).length === 0 ? (
                <p className="text-sm text-neutral-6">Không có phương thức thanh toán nào khả dụng</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {paymentMethods
                    .filter((method) => method.isActive)
                    .map((method) => {
                      const getMethodIcon = (type: PaymentMethod["type"]) => {
                        switch (type) {
                          case "credit_card":
                            return <CreditCard className="w-5 h-5" />;
                          case "bank_transfer":
                            return <Building2 className="w-5 h-5" />;
                          case "cod":
                            return <Truck className="w-5 h-5" />;
                          default:
                            return <Wallet className="w-5 h-5" />;
                        }
                      };

                      const getMethodLabel = (type: PaymentMethod["type"]) => {
                        switch (type) {
                          case "credit_card":
                            return "Thẻ tín dụng";
                          case "bank_transfer":
                            return "Chuyển khoản ngân hàng";
                          case "cod":
                            return "Thanh toán khi nhận hàng";
                          case "wallet":
                            return "Thanh toán bằng ví";
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
                            return method.name || type;
                        }
                      };

                      const isWalletMethod = method.type === "wallet";
                      const showWalletBalance = isWalletMethod && walletBalance !== null;
                      const walletInsufficient = isWalletMethod && walletBalance !== null && walletBalance < selectedOrderForPayment.totalAmount;

                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          disabled={walletInsufficient}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            selectedPaymentMethod === method.id
                              ? "border-primary-6 bg-primary-10"
                              : walletInsufficient
                              ? "border-border-1 bg-background-1 opacity-60 cursor-not-allowed"
                              : "border-border-1 bg-background-1 hover:border-primary-4 hover:bg-primary-10/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex justify-center items-center w-12 h-12 rounded-lg ${
                                selectedPaymentMethod === method.id
                                  ? "bg-primary-6 text-white"
                                  : "bg-neutral-2 text-neutral-7"
                              }`}
                            >
                              {getMethodIcon(method.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-semibold text-neutral-9">
                                {getMethodLabel(method.type)}
                              </p>
                              {showWalletBalance && (
                                <p className={`text-sm mt-1 ${walletInsufficient ? "text-error" : "text-neutral-6"}`}>
                                  Số dư: {formatPriceVND(walletBalance)}
                                  {walletInsufficient && " (Không đủ)"}
                                </p>
                              )}
                              {!showWalletBalance && method.description && (
                                <p className="text-sm text-neutral-6 mt-1">
                                  {method.description}
                                </p>
                              )}
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selectedPaymentMethod === method.id
                                  ? "border-primary-6 bg-primary-6"
                                  : "border-neutral-4 bg-transparent"
                              }`}
                            >
                              {selectedPaymentMethod === method.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border-1">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setSelectedOrderForPayment(null);
                  setSelectedPaymentMethod("");
                }}
                disabled={isCheckoutLoading}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                variant="solid"
                size="md"
                onClick={handleConfirmPayment}
                disabled={!selectedPaymentMethod || isCheckoutLoading}
                loading={isCheckoutLoading}
                className="flex-1"
              >
                Xác nhận thanh toán
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Section>
  );
};

export default OrdersPanel;
