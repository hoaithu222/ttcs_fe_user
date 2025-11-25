import { memo, MouseEvent, useMemo } from "react";

import { CreditCard, Package, Star, Store, Truck } from "lucide-react";

import Button from "@/foundation/components/buttons/Button";
import { Card } from "@/foundation/components/info/Card";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import type { Order } from "@/core/api/orders/type";

import OrderStepper from "./OrderStepper";

interface StatusBadge {
  label: string;
  className: string;
}

interface OrderCardProps {
  order: Order;
  shippingInfo: StatusBadge;
  paymentInfo: StatusBadge;
  awaitingPayment: boolean;
  cancelingId: string | null;
  reorderingId: string | null;
  onPay: (order: Order) => void;
  onCancel: (orderId: string) => void;
  onSelect: (order: Order) => void;
  onTrack: (order: Order) => void;
  onReorder: (orderId: string) => void;
  onRate: (order: Order) => void;
}

const OrderCard = memo(
  ({
    order,
    shippingInfo,
    paymentInfo,
    awaitingPayment,
    cancelingId,
    reorderingId,
    onPay,
    onCancel,
    onSelect,
    onTrack,
    onReorder,
    onRate,
  }: OrderCardProps) => {
    const shopInfo = typeof order.shopId === "object" ? order.shopId : null;
    const shopName = shopInfo?.name || "Cửa hàng";
    const shopLogo = shopInfo?.logo || "";
    const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];
    const isCancelling = cancelingId === order._id;
    const isReordering = reorderingId === order._id;
    const isDelivered = (order.orderStatus || order.status) === "delivered";

    const handleStopPropagation = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
    };

    const products = useMemo(
      () =>
        orderItems.map((item) => {
          const productInfo = typeof item.productId === "object" ? item.productId : null;
          const productName = productInfo?.name || "Sản phẩm";
          const productImages = productInfo?.images || [];
          let productImage = "";
          if (Array.isArray(productImages) && productImages.length > 0) {
            const firstImage = productImages[0];
            if (typeof firstImage === "object" && firstImage?.url) {
              productImage = firstImage.url;
            }
          }
          return {
            id: item._id || `${order._id}-${productName}`,
            name: productName,
            quantity: item.quantity || 1,
            unitPrice: item.price,
            totalPrice: item.totalPrice || item.price * (item.quantity || 1),
            image: productImage,
          };
        }),
      [order._id, orderItems]
    );

    return (
      <Card
        className="cursor-pointer space-y-4 border border-border-2 bg-background-2 transition hover:border-primary-4"
        onClick={() => onSelect(order)}
      >
        <div className="flex flex-col gap-3 border-b border-border-2 pb-3 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            {shopLogo ? (
              <img
                src={shopLogo}
                alt={shopName}
                className="h-10 w-10 flex-shrink-0 rounded-full border border-border-1 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-10">
                <Store className="h-5 w-5 text-primary-6" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-9">{shopName}</p>
              <p className="text-xs text-neutral-5">
                {order.orderNumber || `Mã #${order._id.slice(-6)}`}
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-wrap justify-end gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${shippingInfo.className}`}>
              {shippingInfo.label}
            </span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${paymentInfo.className}`}>
              {paymentInfo.label}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <OrderStepper status={order.orderStatus || order.status} isCancelled={order.orderStatus === "cancelled" || order.status === "cancelled"} />

          {products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-3 rounded-xl border border-border-1 bg-background-1 p-3"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-16 w-16 flex-shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded bg-neutral-2">
                      <Package className="h-6 w-6 text-neutral-4" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-medium text-neutral-9 line-clamp-2">{product.name}</p>
                    <div className="flex items-center justify-between text-xs text-neutral-6">
                      <span>Số lượng: {product.quantity}</span>
                      <span className="font-semibold text-neutral-9">{formatPriceVND(product.totalPrice)}</span>
                    </div>
                    {product.unitPrice && (
                      <p className="text-xs text-neutral-5">{formatPriceVND(product.unitPrice)} / sản phẩm</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-neutral-1 p-4 text-center text-sm text-neutral-6">
              Không có thông tin sản phẩm
            </div>
          )}

          <div className="space-y-2 rounded-xl border border-border-1 bg-background-1 p-3">
            <div className="flex items-center justify-between text-xs text-neutral-6">
              <span>Ngày đặt</span>
              <span className="text-neutral-9">
                {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "--"}
              </span>
            </div>
            {order.discountAmount && order.discountAmount > 0 && (
              <div className="flex items-center justify-between text-xs text-neutral-6">
                <span>Giảm giá</span>
                <span className="text-success">-{formatPriceVND(order.discountAmount)}</span>
              </div>
            )}
            {order.shippingFee !== undefined && order.shippingFee > 0 && (
              <div className="flex items-center justify-between text-xs text-neutral-6">
                <span>Phí vận chuyển</span>
                <span className="text-neutral-9">{formatPriceVND(order.shippingFee)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border-1 pt-2">
              <span className="text-sm font-medium text-neutral-7">Tổng tiền</span>
              <span className="text-lg font-bold text-primary-6">
                {formatPriceVND(order.totalAmount || 0)}
              </span>
            </div>
          </div>

            {awaitingPayment && (
              <div className="rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
                Đơn hàng đang chờ thanh toán. Thanh toán ngay để được xử lý nhanh hơn.
              </div>
            )}

          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(event) => {
                  handleStopPropagation(event);
                  onTrack(order);
                }}
                icon={<Truck className="mr-1.5 h-4 w-4" />}
              >
               
                Theo dõi đơn
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(event) => {
                  handleStopPropagation(event);
                  onReorder(order._id);
                }}
                disabled={isReordering}
                loading={isReordering}
                icon={<CreditCard className="mr-1.5 h-4 w-4" />}
              >
               
                {isReordering ? "Đang xử lý..." : "Mua lại"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(event) => {
                  handleStopPropagation(event);
                  onRate(order);
                }}
                disabled={!isDelivered}
                icon={<Star className="mr-1.5 h-4 w-4" />}
              >
                Đánh giá
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {awaitingPayment && (
                <Button
                  color="blue"
                  size="sm"
                  onClick={(event) => {
                    handleStopPropagation(event);
                    onPay(order);
                  }}
                >
                  Thanh toán ngay
                </Button>
              )}
              {(order.orderStatus === "pending" || order.orderStatus === "processing") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(event) => {
                    handleStopPropagation(event);
                    onCancel(order._id);
                  }}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Đang hủy..." : "Hủy đơn"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

OrderCard.displayName = "OrderCard";

export default OrderCard;


