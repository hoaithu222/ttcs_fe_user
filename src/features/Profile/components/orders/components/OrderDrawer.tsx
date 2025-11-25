import { useMemo } from "react";

import { Clock, MapPin, PackageCheck } from "lucide-react";

import Button from "@/foundation/components/buttons/Button";
import SideDrawer from "@/foundation/components/sidedrawer/SideDrawer";
import type { Order, OrderTracking } from "@/core/api/orders/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";

interface OrderDrawerProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  isLoading: boolean;
  trackingHistory: OrderTracking[];
  trackingError: string | null;
  onContactSupport?: () => void;
}

const OrderDrawer = ({
  open,
  order,
  onClose,
  isLoading,
  trackingHistory,
  trackingError,
  onContactSupport,
}: OrderDrawerProps) => {
  const timeline = useMemo(() => {
    if (!order) return trackingHistory;
    if (trackingHistory.length > 0) return trackingHistory;
    if (Array.isArray(order.orderHistory)) {
      return order.orderHistory.map((history) => ({
        status: history.status,
        timestamp: history.createdAt || order.createdAt,
        note: history.description,
      }));
    }
    return [];
  }, [order, trackingHistory]);

  return (
    <SideDrawer
      open={open}
      onOpenChange={(state) => {
        if (!state) onClose();
      }}
      onCancel={onClose}
      side="right"
      size="lg"
      hideFooter
      title="Chi tiết vận chuyển"
    >
      {!order ? (
        <div className="flex h-full items-center justify-center text-sm text-neutral-6">
          Không tìm thấy thông tin đơn hàng
        </div>
      ) : (
        <div className="flex h-full flex-col gap-4">
          <section className="rounded-xl border border-border-2 bg-background-1 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-neutral-9">Mã đơn</p>
              <span className="text-sm text-primary-6">{order?.orderNumber || order._id}</span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-neutral-7 md:grid-cols-2">
              <div>
                <p className="text-neutral-5">Ngày đặt</p>
                <p>{order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "--"}</p>
              </div>
              <div>
                <p className="text-neutral-5">Tổng tiền</p>
                <p className="font-semibold text-primary-6">{formatPriceVND(order.totalAmount || 0)}</p>
              </div>
              <div>
                <p className="text-neutral-5">Trạng thái</p>
                <p className="capitalize">{order.orderStatus || order.status}</p>
              </div>
              <div>
                <p className="text-neutral-5">Phương thức thanh toán</p>
                <p className="capitalize">{order.paymentMethod || "--"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border-2 bg-background-1 p-4">
            <div className="flex items-center gap-2 border-b border-border-1 pb-3">
              <MapPin className="h-5 w-5 text-primary-6" />
              <div>
                <p className="text-sm font-semibold text-neutral-9">Địa chỉ giao hàng</p>
                <p className="text-sm text-neutral-6">
                  {(order.shippingAddress?.address ||
                    (typeof order.addressId === "object" ? order.addressId.address : "")) ??
                    "—"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm text-neutral-6">
                <Clock className="h-4 w-4 text-neutral-5" />
                <span>
                  Cập nhật lần cuối:{" "}
                  {order.updatedAt ? new Date(order.updatedAt).toLocaleString("vi-VN") : "--"}
                </span>
              </div>
              {trackingError && (
                <div className="rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">
                  {trackingError}
                </div>
              )}

              <div className="relative space-y-6">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="mt-1 h-3 w-3 rounded-full bg-neutral-3" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/3 rounded bg-neutral-2" />
                          <div className="h-3 w-1/2 rounded bg-neutral-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : timeline.length > 0 ? (
                  timeline.map((event, index) => (
                    <div key={event.timestamp + event.status} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                            index === 0 ? "border-primary-6 text-primary-6" : "border-border-2 text-neutral-5"
                          }`}
                        >
                          <PackageCheck className="h-3 w-3" />
                        </div>
                        {index < timeline.length - 1 && (
                          <div className="mt-1 h-full w-0.5 bg-border-2" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-neutral-8 capitalize">{event.status}</p>
                        <p className="text-xs text-neutral-5">
                          {event.timestamp ? new Date(event.timestamp).toLocaleString("vi-VN") : "--"}
                        </p>
                        {event.note && (
                          <p className="mt-1 text-sm text-neutral-6">{event.note}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-6">Chưa có dữ liệu vận chuyển</p>
                )}
              </div>
            </div>
          </section>

          <div className="mt-auto flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Đóng
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                onContactSupport?.();
              }}
            >
              Liên hệ hỗ trợ
            </Button>
          </div>
        </div>
      )}
    </SideDrawer>
  );
};

export default OrderDrawer;


