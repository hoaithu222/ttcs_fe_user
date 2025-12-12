import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CreditCard, Wallet, Building2, Truck } from "lucide-react";

import { addToast } from "@/app/store/slices/toast";
import { ReduxStateType } from "@/app/store/types";
import { userOrdersApi } from "@/core/api/orders";
import type { Order, OrderTracking } from "@/core/api/orders/type";
import type { PaymentMethod } from "@/core/api/payments/type";
import { userWalletApi } from "@/core/api/wallet";
import Button from "@/foundation/components/buttons/Button";
import Empty from "@/foundation/components/empty/Empty";
import { Card } from "@/foundation/components/info/Card";
import ConfirmModal from "@/foundation/components/modal/ModalConfirm";
import Modal from "@/foundation/components/modal/Modal";
import Section from "@/foundation/components/sections/Section";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import { usePayment } from "@/features/Payment/hooks";

import { useProfileOrders } from "../../hooks/useOrder";
import OrderCard from "./components/OrderCard";
import OrderDrawer from "./components/OrderDrawer";
import OrdersFilters, { OrdersTabKey } from "./components/OrdersFilters";
import OrdersSkeleton from "./components/OrdersSkeleton";
import ShopChatModal from "@/features/Chat/components/ShopChatModal";

const OrdersPanel = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders, status, loadOrders } = useProfileOrders();
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OrdersTabKey>("all");
  
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

  const [filters, setFilters] = useState<{
    searchCode: string;
    dateFrom: Date | null;
    dateTo: Date | null;
  }>({
    searchCode: "",
    dateFrom: null,
    dateTo: null,
  });
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [trackingHistory, setTrackingHistory] = useState<OrderTracking[]>([]);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const trackingCacheRef = useRef<Record<string, OrderTracking[]>>({});
  
  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatShopId, setChatShopId] = useState<string | undefined>();
  const [chatShopName, setChatShopName] = useState<string | undefined>();
  const [chatShopAvatar, setChatShopAvatar] = useState<string | undefined>();
  const [chatOrderId, setChatOrderId] = useState<string | undefined>();

  useEffect(() => {
    loadOrders(1, 10);
  }, [loadOrders]);

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
  const handlePaymentClick = useCallback((order: Order) => {
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

  const tabs = useMemo(
    () =>
      [
      { key: "all", label: "Tất cả" },
      { key: "awaiting_payment", label: "Chờ thanh toán" },
      { key: "pending", label: "Chờ xác nhận" },
      { key: "processing", label: "Đang xử lý" },
      { key: "shipped", label: "Đang vận chuyển" },
      { key: "delivered", label: "Đã giao" },
      { key: "cancelled", label: "Đã hủy" },
      ] as Array<{ key: OrdersTabKey; label: string }>,
    []
  );

  const handleFiltersChange = useCallback(
    (partial: Partial<typeof filters>) => {
      setFilters((prev) => {
        const next = { ...prev, ...partial };
        if (next.dateFrom && next.dateTo && next.dateFrom > next.dateTo) {
          dispatch(
            addToast({
              type: "warning",
              message: "Ngày bắt đầu không được lớn hơn ngày kết thúc",
            })
          );
          return { ...next, dateTo: next.dateFrom };
        }
        return next;
      });
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    setFilters({ searchCode: "", dateFrom: null, dateTo: null });
  }, []);

  const filteredOrders = useMemo(() => {
    if (!orders || !orders.length) return [];
    const normalizedSearch = filters.searchCode.trim().toLowerCase();
    const fromTime = filters.dateFrom
      ? new Date(filters.dateFrom).setHours(0, 0, 0, 0)
      : null;
    const toTime = filters.dateTo ? new Date(filters.dateTo).setHours(23, 59, 59, 999) : null;

    return orders.filter((order: Order) => {
      const statusKey = (order.orderStatus || order.status || "pending") as typeof activeTab;

      if (activeTab === "awaiting_payment") {
        const awaiting = !(order.isPay || order.paymentStatus === "completed");
        if (!awaiting) return false;
      } else if (activeTab !== "all" && statusKey !== activeTab) {
        return false;
      }

      if (normalizedSearch) {
        const sources = [order?.orderNumber, order._id]
          .filter(Boolean)
          .map((value) => value?.toString().toLowerCase());
        const hasMatch = sources.some((value) => value?.includes(normalizedSearch));
        if (!hasMatch) return false;
      }

      if (fromTime || toTime) {
        const createdTimestamp = order.createdAt ? new Date(order.createdAt).getTime() : null;
        if (!createdTimestamp) return false;
        if (fromTime && createdTimestamp < fromTime) return false;
        if (toTime && createdTimestamp > toTime) return false;
      }

      return true;
    });
  }, [orders, activeTab, filters]);

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

  const fetchTrackingData = useCallback(
    async (order: Order) => {
      setTrackingError(null);
      if (trackingCacheRef.current[order._id]) {
        setTrackingHistory(trackingCacheRef.current[order._id]);
        return;
      }
      setIsTrackingLoading(true);
      try {
        const response = await userOrdersApi.trackOrder(order._id);
        const history = response.data?.trackingHistory || [];
        trackingCacheRef.current[order._id] = history;
        setTrackingHistory(history);
      } catch (error) {
        console.error("Failed to load tracking history:", error);
        setTrackingError("Không thể tải thông tin vận chuyển. Vui lòng thử lại sau.");
        dispatch(
          addToast({
            type: "error",
            message: "Không thể tải thông tin vận chuyển",
          })
        );
      } finally {
        setIsTrackingLoading(false);
      }
    },
    [dispatch]
  );

  const handleOpenDrawer = useCallback(
    (order: Order) => {
      setSelectedOrder(order);
      setIsDrawerOpen(true);
      const cachedHistory = trackingCacheRef.current[order._id];
      if (cachedHistory) {
        setTrackingHistory(cachedHistory);
      } else {
        setTrackingHistory([]);
        fetchTrackingData(order);
      }
    },
    [fetchTrackingData]
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedOrder(null);
    setTrackingHistory([]);
    setTrackingError(null);
  }, []);

  const handleTrackOrder = useCallback(
    (order: Order) => {
      handleOpenDrawer(order);
    },
    [handleOpenDrawer]
  );

  const handleReorder = useCallback(
    async (orderId: string) => {
      try {
        setReorderingId(orderId);
        await userOrdersApi.reorder(orderId);
        dispatch(
          addToast({
            type: "success",
            message: "Đã thêm sản phẩm vào giỏ của bạn",
          })
        );
      } catch (error) {
        console.error("Failed to reorder:", error);
        dispatch(
          addToast({
            type: "error",
            message: "Không thể mua lại đơn hàng. Vui lòng thử lại.",
          })
        );
      } finally {
        setReorderingId(null);
      }
    },
    [dispatch]
  );

  const handleRateOrder = useCallback(
    (order: Order) => {
      if ((order.orderStatus || order.status) !== "delivered") {
        dispatch(
          addToast({
            type: "warning",
            message: "Bạn chỉ có thể đánh giá sau khi đơn đã được giao.",
          })
        );
        return;
      }
      navigate(`/profile?tab=reviews&orderId=${order._id}`);
    },
    [dispatch, navigate]
  );

  const handleContactSupport = useCallback(() => {
    if (!selectedOrder) {
      dispatch(
        addToast({
          type: "info",
          message: "Liên hệ hotline 1900-636-000 để được hỗ trợ.",
        })
      );
      return;
    }
    
    // Lấy thông tin shop từ order
    const shopId = typeof selectedOrder.shopId === "string" 
      ? selectedOrder.shopId 
      : selectedOrder.shopId?._id;
    const shopName = typeof selectedOrder.shopId === "object" 
      ? selectedOrder.shopId.name 
      : "Cửa hàng";
    const shopAvatar = typeof selectedOrder.shopId === "object" 
      ? selectedOrder.shopId.logo 
      : undefined;
    
    if (!shopId) {
      dispatch(
        addToast({
          type: "error",
          message: "Không tìm thấy thông tin cửa hàng.",
        })
      );
      return;
    }
    
    // Mở chat modal với thông tin shop và order
    setChatShopId(shopId);
    setChatShopName(shopName);
    setChatShopAvatar(shopAvatar);
    setChatOrderId(selectedOrder._id);
    setIsChatOpen(true);
    // Đóng drawer khi mở chat
    setIsDrawerOpen(false);
  }, [dispatch, selectedOrder]);

  return (
    <Section title="Đơn hàng của tôi" className="max-h-[calc(100vh-100px)] overflow-y-auto">
      <Card className="space-y-4 bg-background-1 hidden-scrollbar *:max-h-[calc(100vh-100px)] overflow-y-auto">
        <OrdersFilters
          tabs={tabs}
          activeTab={activeTab}
          countsByTab={countsByTab}
          onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onResetFilters={resetFilters}
        />

        {isLoading ? (
          <OrdersSkeleton />
        ) : hasOrders ? (
          <div className="space-y-3 pt-1">
            {filteredOrders.map((order: Order) => {
              const shippingStatus =
                (order.orderStatus || order.status || "pending") as keyof typeof shippingStatusMap;
              const paymentStatus = (
                order.paymentStatus || (order.isPay ? "completed" : "pending")
              ) as keyof typeof paymentStatusMap;
              const shippingInfo = shippingStatusMap[shippingStatus] || shippingStatusMap.pending;
              const paymentInfo = paymentStatusMap[paymentStatus] || paymentStatusMap.pending;
              const awaitingPayment =
                paymentStatus === "pending" || paymentStatus === "processing";

              return (
                <OrderCard
                  key={order._id}
                  order={order}
                  shippingInfo={shippingInfo}
                  paymentInfo={paymentInfo}
                  awaitingPayment={awaitingPayment}
                  cancelingId={cancelingId}
                  reorderingId={reorderingId}
                  onPay={handlePaymentClick}
                  onCancel={handleCancel}
                  onSelect={handleTrackOrder}
                  onTrack={handleTrackOrder}
                  onReorder={handleReorder}
                  onRate={handleRateOrder}
                />
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

      <OrderDrawer
        open={isDrawerOpen}
        order={selectedOrder}
        onClose={handleCloseDrawer}
        trackingHistory={trackingHistory}
        trackingError={trackingError}
        isLoading={isTrackingLoading}
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
                          case "bank_transfer":
                            return <Building2 className="w-5 h-5" />;
                          case "cod":
                            return <Truck className="w-5 h-5" />;
                          case "wallet":
                          default:
                            return <Wallet className="w-5 h-5" />;
                        }
                      };

                      const getMethodLabel = (type: PaymentMethod["type"]) => {
                        switch (type) {
                          case "bank_transfer":
                            return "Chuyển khoản qua ngân hàng (Sepay)";
                          case "cod":
                            return "Thanh toán khi nhận hàng";
                          case "wallet":
                            return "Thanh toán bằng ví";
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

      {/* Shop Chat Modal */}
      <ShopChatModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatShopId(undefined);
          setChatShopName(undefined);
          setChatShopAvatar(undefined);
          setChatOrderId(undefined);
        }}
        shopId={chatShopId}
        shopName={chatShopName}
        shopAvatar={chatShopAvatar}
        orderId={chatOrderId}
      />
    </Section>
  );
};

export default OrdersPanel;
