import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Section from "@/foundation/components/sections/Section";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import { getOrdersStart, updateOrderStatusStart } from "@/features/Shop/slice/shop.slice";
import {
  selectOrders,
  selectOrdersStatus,
  selectOrdersError,
  selectOrdersPagination,
} from "@/features/Shop/slice/shop.selector";
import { ReduxStateType } from "@/app/store/types";
import { ShopOrder } from "@/core/api/shop-management/type";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  ShoppingCart,
} from "lucide-react";
import UpdateOrderStatusModal from "./UpdateOrderStatusModal";
import { addToast } from "@/app/store/slices/toast";

// Định nghĩa các tab và trạng thái
const ORDER_TABS = [
  { value: "all", label: "Tất cả", icon: ShoppingCart },
  { value: "pending", label: "Chờ xử lý", icon: Clock },
  { value: "processing", label: "Đang xử lý", icon: Package },
  { value: "shipped", label: "Đã giao hàng", icon: Truck },
  { value: "delivered", label: "Đã nhận hàng", icon: CheckCircle },
  { value: "cancelled", label: "Đã hủy", icon: XCircle },
] as const;

// Định nghĩa workflow chuyển đổi trạng thái
const STATUS_WORKFLOW: Record<string, { next: string[]; actions: Array<{ status: string; label: string; color: string }> }> = {
  pending: {
    next: ["processing", "cancelled"],
    actions: [
      { status: "processing", label: "Xác nhận đơn", color: "blue" },
      { status: "cancelled", label: "Hủy đơn", color: "red" },
    ],
  },
  processing: {
    next: ["shipped", "cancelled"],
    actions: [
      { status: "shipped", label: "Đã giao hàng", color: "green" },
      { status: "cancelled", label: "Hủy đơn", color: "red" },
    ],
  },
  shipped: {
    next: ["delivered"],
    actions: [{ status: "delivered", label: "Đã nhận hàng", color: "success" }],
  },
  delivered: {
    next: [],
    actions: [],
  },
  cancelled: {
    next: [],
    actions: [],
  },
};

const deriveOrderStatus = (order: Partial<ShopOrder> & Record<string, any>) => {
  return order.orderStatus || order.status || "pending";
};

const deriveOrderNumber = (order: Partial<ShopOrder> & Record<string, any>) => {
  if (order.orderNumber) return order.orderNumber;
  if (order._id) return `#${String(order._id).slice(-6).toUpperCase()}`;
  return "#UNKNOWN";
};

const deriveOrderItems = (order: Partial<ShopOrder> & Record<string, any>) => {
  const items = order.items;
  if (Array.isArray(items)) {
    return items.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.productName === "string" &&
        typeof item.quantity === "number"
    );
  }

  const orderItemsDetails = order.orderItemsDetails || order.orderItemDetails;
  if (Array.isArray(orderItemsDetails)) {
    return orderItemsDetails;
  }

  // Backend cũ chỉ trả về mảng id => bỏ qua để tránh lỗi map
  return [];
};

const OrderShop: React.FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders) as ShopOrder[];
  const ordersStatus = useSelector(selectOrdersStatus);
  const ordersError = useSelector(selectOrdersError);
  const pagination = useSelector(selectOrdersPagination);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(
      getOrdersStart({
        page: currentPage,
        limit: 10,
        orderStatus: activeTab === "all" ? undefined : activeTab,
      })
    );
  }, [dispatch, currentPage, activeTab]);

  const handleStatusUpdateClick = (order: ShopOrder, newStatus: string) => {
    setSelectedOrder(order);
    setUpdateStatus(newStatus);
    setIsModalOpen(true);
  };

  const handleConfirmUpdate = (data: {
    orderStatus: string;
    trackingNumber?: string;
    notes?: string;
  }) => {
    if (!selectedOrder) return;

    setUpdatingOrderId(selectedOrder._id);
    dispatch(
      updateOrderStatusStart({
        orderId: selectedOrder._id,
        data,
      })
    );
  };

  // Listen for update success
  useEffect(() => {
    if (updatingOrderId && ordersStatus === ReduxStateType.SUCCESS) {
      dispatch(addToast({ type: "success", message: "Đã cập nhật trạng thái đơn hàng thành công" }));
      setIsModalOpen(false);
      setSelectedOrder(null);
      setUpdatingOrderId(null);
      // Refresh orders
      dispatch(
        getOrdersStart({
          page: currentPage,
          limit: 10,
          orderStatus: activeTab === "all" ? undefined : activeTab,
        })
      );
    }
  }, [ordersStatus, updatingOrderId, dispatch, currentPage, activeTab]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: {
        label: "Chờ xử lý",
        color: "bg-warning/20 text-warning",
        icon: <Clock className="w-4 h-4" />,
      },
      processing: {
        label: "Đang xử lý",
        color: "bg-primary-6/20 text-primary-6",
        icon: <Package className="w-4 h-4" />,
      },
      shipped: {
        label: "Đã giao hàng",
        color: "bg-blue-500/20 text-blue-600",
        icon: <Truck className="w-4 h-4" />,
      },
      delivered: {
        label: "Đã nhận hàng",
        color: "bg-success/20 text-success",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      cancelled: {
        label: "Đã hủy",
        color: "bg-error/20 text-error",
        icon: <XCircle className="w-4 h-4" />,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <div
        className={`flex gap-1 items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}
      >
        {config.icon}
        {config.label}
      </div>
    );
  };

  const isLoading = ordersStatus === ReduxStateType.LOADING;
  const isUpdating = updatingOrderId !== null && isLoading;

  // Đếm số đơn hàng theo từng trạng thái
  const getOrderCountByStatus = (status: string) => {
    if (status === "all") return orders.length;
    return orders.filter((order) => deriveOrderStatus(order) === status).length;
  };

  return (
    <div>
      <div className="flex gap-4 items-center mb-6">
        <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary-6">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-9">Quản lý đơn hàng</h1>
          <p className="text-sm text-neutral-6">Theo dõi và xử lý đơn hàng của cửa hàng</p>
        </div>
      </div>

      <Section>
        {/* Tabs */}
        <div className="mb-6 border-b border-border-1">
          <div className="flex gap-2 overflow-x-auto">
            {ORDER_TABS.map((tab) => {
              const Icon = tab.icon;
              const count = getOrderCountByStatus(tab.value);
              const isActive = activeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setActiveTab(tab.value);
                    setCurrentPage(1);
                  }}
                  className={`flex gap-2 items-center px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-primary-6 text-primary-6 font-semibold"
                      : "border-transparent text-neutral-6 hover:text-neutral-9 hover:border-neutral-3"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        isActive
                          ? "bg-primary-6/20 text-primary-6"
                          : "bg-neutral-2 text-neutral-6"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading && !updatingOrderId ? (
          <Loading layout="centered" message="Đang tải đơn hàng..." />
        ) : ordersError ? (
          <Empty
            variant="default"
            title="Lỗi tải dữ liệu"
            description={ordersError || undefined}
          />
        ) : !orders || orders.length === 0 ? (
          <Empty variant="data" title="Chưa có đơn hàng" description="Chưa có đơn hàng nào" />
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => {
                const status = deriveOrderStatus(order);
                const workflow = STATUS_WORKFLOW[status] || { next: [], actions: [] };
                const availableActions = workflow.actions;
                const orderItems = deriveOrderItems(order);
                const orderNumber = deriveOrderNumber(order);

                return (
                  <div
                    key={order._id}
                    className="p-4 bg-background-1 rounded-lg border border-border-1 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-4 items-center">
                          <span className="font-semibold text-neutral-9">{orderNumber}</span>
                          {getStatusBadge(status)}
                        </div>
                        <div className="text-sm text-neutral-6">
                          <p>Khách hàng: {order.user?.name || "N/A"}</p>
                          <p>Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                          {order.trackingNumber && (
                            <p className="text-primary-6">
                              Mã vận đơn: <span className="font-semibold">{order.trackingNumber}</span>
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          {orderItems.length > 0 ? (
                            orderItems.map((item, idx) => (
                              <div key={idx} className="flex gap-2 text-sm text-neutral-7">
                                <span>{item.productName || "Sản phẩm"}</span>
                                <span>x{item.quantity ?? 0}</span>
                                <span className="ml-auto">
                                  {formatPrice(item.totalPrice ?? item.price ?? 0)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-neutral-5 italic">
                              Không có thông tin chi tiết sản phẩm
                            </p>
                          )}
                        </div>
                        {order.notes && (
                          <div className="p-2 bg-neutral-2 rounded text-sm text-neutral-6">
                            <span className="font-medium">Ghi chú: </span>
                            {order.notes}
                          </div>
                        )}
                        <div className="pt-2 border-t border-border-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-6">Tổng tiền:</span>
                            <span className="text-lg font-bold text-primary-6">
                              {formatPrice(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>

                        <div className="flex flex-col gap-2">
                        {availableActions.map((action) => (
                          <Button
                            key={action.status}
                            color={action.color as any}
                            variant="solid"
                            size="sm"
                            onClick={() => handleStatusUpdateClick(order, action.status)}
                            disabled={isUpdating && updatingOrderId === order._id}
                          >
                            {action.label}
                          </Button>
                        ))}
                        {availableActions.length === 0 && (
                          <p className="text-xs text-neutral-5 italic">Không có thao tác</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex gap-2 justify-center items-center mt-6">
                <Button
                  color="blue"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Trước
                </Button>
                <span className="text-sm text-neutral-7">
                  Trang {currentPage} / {pagination.totalPages}
                </span>
                <Button
                  color="blue"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </Section>

      <UpdateOrderStatusModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
          setUpdateStatus("");
        }}
        order={selectedOrder}
        currentStatus={selectedOrder?.orderStatus || ""}
        newStatus={updateStatus}
        onConfirm={handleConfirmUpdate}
        loading={isUpdating}
      />
    </div>
  );
};

export default OrderShop;
