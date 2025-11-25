import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import ShopOrdersHeader from "./components/ShopOrdersHeader";
import ShopOrdersTabs from "./components/ShopOrdersTabs";
import ShopOrderCard from "./components/ShopOrderCard";
import { shopManagementApi } from "@/core/api/shop-management";

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
  const navigate = useNavigate();
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
  const [statusTotals, setStatusTotals] = useState<Record<string, number>>(() =>
    ORDER_TABS.reduce(
      (acc, tab) => ({
        ...acc,
        [tab.value]: 0,
      }),
      {}
    )
  );
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  const fetchStatusTotals = useCallback(async () => {
    try {
      const responses = await Promise.all(
        ORDER_TABS.map((tab) =>
          shopManagementApi.getOrders({
            page: 1,
            limit: 1,
            orderStatus: tab.value === "all" ? undefined : tab.value,
          })
        )
      );
      const totals: Record<string, number> = {};
      responses.forEach((response, index) => {
        const key = ORDER_TABS[index].value;
        totals[key] = response.data?.pagination?.total ?? 0;
      });
      setStatusTotals(totals);
    } catch (error) {
      console.error("Failed to load order totals", error);
    }
  }, []);

  useEffect(() => {
    fetchStatusTotals();
  }, [fetchStatusTotals]);

  useEffect(() => {
    setSelectedOrderIds((prev) =>
      prev.filter((id) => orders.some((order) => order._id === id))
    );
  }, [orders]);

  useEffect(() => {
    dispatch(
      getOrdersStart({
        page: currentPage,
        limit: 10,
        orderStatus: activeTab === "all" ? undefined : activeTab,
      })
    );
  }, [dispatch, currentPage, activeTab]);

  useEffect(() => {
    if (ordersStatus === ReduxStateType.SUCCESS && pagination?.total !== undefined) {
      setStatusTotals((prev) => ({
        ...prev,
        [activeTab]: pagination.total,
        ...(activeTab === "all" ? { all: pagination.total } : {}),
      }));
    }
  }, [ordersStatus, pagination, activeTab]);

  const dispatchStatusUpdate = useCallback(
    (orderId: string, data: { orderStatus: string; trackingNumber?: string; notes?: string }) => {
      setUpdatingOrderId(orderId);
      dispatch(
        updateOrderStatusStart({
          orderId,
          data,
        })
      );
    },
    [dispatch]
  );

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
    dispatchStatusUpdate(selectedOrder._id, data);
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
      fetchStatusTotals();
    }
  }, [ordersStatus, updatingOrderId, dispatch, currentPage, activeTab, fetchStatusTotals]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const isLoading = ordersStatus === ReduxStateType.LOADING;
  const isUpdating = updatingOrderId !== null && isLoading;

  const toggleSelectOrder = useCallback((orderId: string, selected: boolean) => {
    setSelectedOrderIds((prev) => {
      if (selected) {
        return prev.includes(orderId) ? prev : [...prev, orderId];
      }
      return prev.filter((id) => id !== orderId);
    });
  }, []);

  const areAllCurrentSelected = useMemo(() => {
    if (!orders.length) return false;
    return orders.every((order) => selectedOrderIds.includes(order._id));
  }, [orders, selectedOrderIds]);

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds((prev) => {
        const ids = orders.map((order) => order._id);
        const merged = new Set([...prev, ...ids]);
        return Array.from(merged);
      });
    } else {
      setSelectedOrderIds((prev) =>
        prev.filter((id) => !orders.some((order) => order._id === id))
      );
    }
  };

  const handleBatchPrint = async (type: "packing" | "shipping") => {
    if (!selectedOrderIds.length) {
      dispatch(addToast({ type: "info", message: "Hãy chọn ít nhất một đơn để in." }));
      return;
    }
    try {
      const printType = type === "packing" ? "packing" : "invoice";
      const result = await shopManagementApi.batchPrintOrders(selectedOrderIds, printType);
      
      if (result.success && result.data) {
        const { pdfLinks, zipUrl } = result.data;
        
        // Open ZIP download if multiple orders
        if (selectedOrderIds.length > 1 && zipUrl) {
          window.open(zipUrl, "_blank");
          dispatch(addToast({ 
            type: "success", 
            message: `Đã tạo file ZIP cho ${selectedOrderIds.length} đơn. Đang tải xuống...` 
          }));
        } else if (pdfLinks && pdfLinks.length > 0) {
          // Open first PDF in new tab
          window.open(pdfLinks[0].pdfUrl, "_blank");
          dispatch(addToast({ 
            type: "success", 
            message: `Đã mở ${printType === "packing" ? "phiếu nhặt hàng" : "vận đơn"} cho đơn ${pdfLinks[0].orderNumber}` 
          }));
        }
      }
    } catch (error: any) {
      dispatch(addToast({ 
        type: "error", 
        message: error?.message || "Không thể tạo file in. Vui lòng thử lại." 
      }));
    }
  };

  const handleQuickConfirm = (order: ShopOrder) => {
    dispatchStatusUpdate(order._id, {
      orderStatus: "processing",
      notes: "Xác nhận & đóng gói nhanh",
    });
  };

  const handleQuickCancel = (order: ShopOrder) => {
    setSelectedOrder(order);
    setUpdateStatus("cancelled");
    setIsModalOpen(true);
  };

  const handleOpenChat = (order: ShopOrder) => {
    navigate(`/chat?userId=${order.userId}`);
  };

  const tabsWithCounts = useMemo(
    () =>
      ORDER_TABS.map((tab) => ({
        ...tab,
        count: statusTotals[tab.value] ?? 0,
      })),
    [statusTotals]
  );

  return (
    <div>
      <ShopOrdersHeader totalOrders={statusTotals.all || 0} pendingOrders={statusTotals.pending || 0} />

      <Section className="space-y-6">
        <ShopOrdersTabs
          tabs={tabsWithCounts}
          activeTab={activeTab}
          onTabChange={(tabValue) => {
            setActiveTab(tabValue);
            setCurrentPage(1);
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-2 bg-background-2 p-4">
          <label className="flex items-center gap-2 text-sm text-neutral-6">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary-6"
              checked={areAllCurrentSelected}
              onChange={(event) => handleToggleSelectAll(event.target.checked)}
            />
            Chọn tất cả ({selectedOrderIds.length} đơn)
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBatchPrint("packing")}
              disabled={!selectedOrderIds.length}
            >
              In phiếu nhặt hàng
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBatchPrint("shipping")}
              disabled={!selectedOrderIds.length}
            >
              In vận đơn
            </Button>
          </div>
        </div>

        {isLoading && !updatingOrderId ? (
          <Loading layout="centered" message="Đang tải đơn hàng..." />
        ) : ordersError ? (
          <Empty variant="default" title="Lỗi tải dữ liệu" description={ordersError || undefined} />
        ) : !orders || orders.length === 0 ? (
          <Empty variant="data" title="Chưa có đơn hàng" description="Chưa có đơn hàng nào" />
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => {
                const status = deriveOrderStatus(order);
                const workflow = STATUS_WORKFLOW[status] || { next: [], actions: [] };
                return (
                  <ShopOrderCard
                    key={order._id}
                    order={order}
                    orderNumber={deriveOrderNumber(order)}
                    status={status}
                    orderItems={deriveOrderItems(order)}
                    actions={workflow.actions}
                    formatPrice={formatPrice}
                    onActionClick={handleStatusUpdateClick}
                    isUpdating={isUpdating && updatingOrderId === order._id}
                    enableSelection
                    isSelected={selectedOrderIds.includes(order._id)}
                    onSelectChange={(checked) => toggleSelectOrder(order._id, checked)}
                    onQuickConfirm={status === "pending" ? () => handleQuickConfirm(order) : undefined}
                    onQuickCancel={status === "pending" ? () => handleQuickCancel(order) : undefined}
                    onChat={() => handleOpenChat(order)}
                    onPrintPacking={() => handleBatchPrint("packing")}
                    onPrintShipping={() => handleBatchPrint("shipping")}
                  />
                );
              })}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  color="blue"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Trang trước
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
                  Trang sau
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
