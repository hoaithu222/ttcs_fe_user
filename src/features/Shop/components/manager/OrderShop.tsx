import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Form from "@radix-ui/react-form";
import Section from "@/foundation/components/sections/Section";
import Select from "@/foundation/components/input/Select";
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
import { Package, CheckCircle, XCircle, Clock } from "lucide-react";

const OrderShop: React.FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders) as ShopOrder[];
  const ordersStatus = useSelector(selectOrdersStatus);
  const ordersError = useSelector(selectOrdersError);
  const pagination = useSelector(selectOrdersPagination);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(
      getOrdersStart({
        page: currentPage,
        limit: 10,
        orderStatus: statusFilter === "all" ? undefined : statusFilter,
      })
    );
  }, [dispatch, currentPage, statusFilter]);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    dispatch(
      updateOrderStatusStart({
        orderId,
        data: { orderStatus: newStatus },
      })
    );
  };

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
        color: "bg-primary-6/20 text-primary-6",
        icon: <Package className="w-4 h-4" />,
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
          <Form.Root>
            <div className="flex gap-4 mb-6">
              <div className="w-48">
                <Select
                  name="status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "all", label: "Tất cả" },
                    { value: "pending", label: "Chờ xử lý" },
                    { value: "processing", label: "Đang xử lý" },
                    { value: "shipped", label: "Đã giao hàng" },
                    { value: "delivered", label: "Đã nhận hàng" },
                    { value: "cancelled", label: "Đã hủy" },
                  ]}
                  placeholder="Lọc theo trạng thái"
                />
              </div>
            </div>
          </Form.Root>

          {isLoading ? (
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
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="p-4 bg-background-1 rounded-lg border border-border-1 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-4 items-center">
                          <span className="font-semibold text-neutral-9">#{order.orderNumber}</span>
                          {getStatusBadge(order.orderStatus)}
                        </div>
                        <div className="text-sm text-neutral-6">
                          <p>Khách hàng: {order.user?.name || "N/A"}</p>
                          <p>Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                        </div>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 text-sm text-neutral-7">
                              <span>{item.productName}</span>
                              <span>x{item.quantity}</span>
                              <span className="ml-auto">{formatPrice(item.totalPrice)}</span>
                            </div>
                          ))}
                        </div>
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
                        {order.orderStatus === "pending" && (
                          <Button
                            color="blue"
                            variant="solid"
                            size="sm"
                            onClick={() => handleStatusUpdate(order._id, "processing")}
                          >
                            Xác nhận đơn
                          </Button>
                        )}
                        {order.orderStatus === "processing" && (
                          <Button
                            color="green"
                            variant="solid"
                            size="sm"
                            onClick={() => handleStatusUpdate(order._id, "shipped")}
                          >
                            Đã giao hàng
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
    </div>
  );
};

export default OrderShop;
