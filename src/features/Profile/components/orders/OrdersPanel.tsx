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

const OrdersPanel = () => {
  const navigate = useNavigate();
  const { orders, status, loadOrders } = useProfileOrders();
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "awaiting_payment"
  >("all");

  useEffect(() => {
    loadOrders(1, 10);
  }, [loadOrders]);

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

            return (
              <div key={order._id} className="p-4 border rounded-xl bg-background-2 border-border-2 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-neutral-9">
                      Mã đơn: {order.code || `#${order._id.slice(-6)}`}
                    </div>
                    <div className="text-xs text-neutral-5">
                      Ngày đặt:{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("vi-VN")
                        : "--"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {renderBadge(shippingInfo.label, shippingInfo.className)}
                    {renderBadge(paymentInfo.label, paymentInfo.className)}
                  </div>
                </div>

                <div className="text-sm text-neutral-7">
                  Tổng tiền:{" "}
                  <span className="font-semibold text-neutral-9">
                    {formatPriceVND(order.totalAmount || 0)}
                  </span>
                </div>

                {awaitingPayment && (
                  <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
                    Đơn hàng đang chờ thanh toán. Bạn có thể thanh toán ngay để shop xử lý nhanh hơn.
                  </div>
                )}

                <div className="flex flex-wrap gap-2 justify-end">
                  {awaitingPayment && (
                    <Button
                      color="blue"
                      size="sm"
                      onClick={() => navigate(`/payment/${order._id}`)}
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
    </Section>
  );
};

export default OrdersPanel;
