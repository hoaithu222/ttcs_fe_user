import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, ArrowRight, ShoppingBag, Store, MapPin, CreditCard } from "lucide-react";
import Page from "@/foundation/components/layout/Page";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import { userOrdersApi } from "@/core/api/orders";
import type { Order } from "@/core/api/orders/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";

const PaymentResultPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRedirect, setAutoRedirect] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!orderId) {
      navigate("/profile?tab=orders");
      return;
    }

    const loadOrder = async () => {
      try {
        setIsLoading(true);
        const response = await userOrdersApi.getOrder(orderId);
        if (response.success && response.data?.order) {
          setOrder(response.data.order);
          // Tự động chuyển sang màn đơn hàng sau vài giây
          const timer = setTimeout(() => {
            navigate("/profile?tab=orders");
          }, 5000);
          setAutoRedirect(timer);
        } else {
          navigate("/profile?tab=orders");
        }
      } catch {
        navigate("/profile?tab=orders");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();

    return () => {
      if (autoRedirect) {
        clearTimeout(autoRedirect);
      }
    };
  }, [orderId, navigate]);

  if (isLoading) {
    return (
      <Page>
        <div className="min-h-screen bg-background-1 flex items-center justify-center">
          <Loading layout="centered" message="Đang tải thông tin đơn hàng..." />
        </div>
      </Page>
    );
  }

  if (!order) {
    return null;
  }

  const isPaid = !!order.isPay;
  const paymentMethodLabel = (() => {
    switch (order.paymentMethod) {
      case "cod":
        return "Thanh toán khi nhận hàng (COD)";
      case "bank_transfer":
        return "Chuyển khoản qua ngân hàng (Sepay)";
      case "wallet":
        return "Thanh toán bằng ví";
      default:
        return order.paymentMethod || "Không xác định";
    }
  })();

  return (
    <Page>
      <div className="min-h-screen bg-background-1">
        <div className="container mx-auto px-4 py-10 lg:py-14 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-9 mb-3">
              Cảm ơn bạn đã đặt hàng!
            </h1>
            <AlertMessage
              type={isPaid ? "success" : "warning"}
              className="max-w-xl w-full"
              message={
                <div className="text-left">
                  <p className="text-sm text-neutral-7">
                    Đơn hàng của bạn đã được đặt thành công.
                  </p>
                  {isPaid ? (
                    <p className="mt-1 text-sm text-neutral-7">
                      Thanh toán đã được ghi nhận, chúng tôi sẽ sớm xử lý và giao hàng cho bạn.
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-neutral-7">
                      <span className="font-semibold text-warning">
                        Đơn hàng hiện chưa được thanh toán.
                      </span>{" "}
                      Vui lòng thanh toán theo hướng dẫn ở bước trước để đơn hàng được xử lý nhanh chóng.
                    </p>
                  )}
                </div>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Info */}
            <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
              <SectionTitle className="mb-4 flex items-center gap-2 text-base">
                <ShoppingBag className="w-4 h-4 text-primary-6" />
                Thông tin đơn hàng
              </SectionTitle>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-6">Mã đơn hàng:</span>
                  <span className="font-mono text-neutral-9">{order._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-6">Trạng thái đơn:</span>
                  <span className="font-semibold text-primary-6">
                    {order.status === "pending"
                      ? "Đang chờ xử lý"
                      : order.status === "processing"
                      ? "Đang xử lý"
                      : order.status === "shipped"
                      ? "Đang vận chuyển"
                      : order.status === "delivered"
                      ? "Đã giao hàng"
                      : "Đã hủy"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-6">Trạng thái thanh toán:</span>
                  <span className={`font-semibold ${isPaid ? "text-success" : "text-warning"}`}>
                    {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-6">Tổng tiền:</span>
                  <span className="font-bold text-primary-6">
                    {formatPriceVND(order.totalAmount)} VNĐ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-6">Phí vận chuyển:</span>
                  <span className="font-medium text-neutral-9">
                    {order.shippingFee > 0 ? formatPriceVND(order.shippingFee) : "Miễn phí"}
                  </span>
                </div>
              </div>
            </Section>

            {/* Payment & Shipping */}
            <div className="space-y-4">
              <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
                <SectionTitle className="mb-4 flex items-center gap-2 text-base">
                  <CreditCard className="w-4 h-4 text-primary-6" />
                  Thông tin thanh toán
                </SectionTitle>
                <p className="text-sm text-neutral-7 mb-1">{paymentMethodLabel}</p>
                <p className="text-xs text-neutral-6">
                  {order.paymentMethod === "cod"
                    ? "Bạn sẽ thanh toán trực tiếp cho đơn vị vận chuyển khi nhận hàng."
                    : isPaid
                    ? "Thanh toán đã hoàn tất. Bạn không cần thực hiện thêm thao tác nào."
                    : "Nếu bạn chưa hoàn tất thanh toán, vui lòng truy cập lại trang thanh toán để tiếp tục."}
                </p>
              </Section>

              <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
                <SectionTitle className="mb-4 flex items-center gap-2 text-base">
                  <Store className="w-4 h-4 text-primary-6" />
                  Thông tin giao hàng
                </SectionTitle>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-10 flex items-center justify-center text-primary-7">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-neutral-9">
                      {(order.addressId as any)?.fullName || (order.shippingAddress?.name ?? "Người nhận")}
                    </p>
                    <p className="text-neutral-6">
                      SĐT:{" "}
                      {(order.addressId as any)?.phone || order.shippingAddress?.phone || "Đang cập nhật"}
                    </p>
                    <p className="text-neutral-6">
                      Địa chỉ:{" "}
                      {(order.addressId as any)?.address ||
                        order.shippingAddress?.address ||
                        "Đang cập nhật"}
                    </p>
                  </div>
                </div>
              </Section>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-3">
            <Button
              variant="solid"
              size="md"
              className="gap-2"
              onClick={() => navigate("/profile?tab=orders")}
            >
              Xem đơn hàng của tôi
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate("/home")}
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default PaymentResultPage;


