import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ArrowLeft, Calendar, MapPin, Package, Star, Store, User as UserIcon } from "lucide-react";

import Section from "@/foundation/components/sections/Section";
import { Card } from "@/foundation/components/info/Card";
import Button from "@/foundation/components/buttons/Button";
import Empty from "@/foundation/components/empty/Empty";
import Loading from "@/foundation/components/loading/Loading";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import TextArea from "@/foundation/components/input/TextArea";
import RatingInput from "@/foundation/components/rating/RatingInput";
import * as Form from "@radix-ui/react-form";
import { addToast } from "@/app/store/slices/toast";
import { userOrdersApi } from "@/core/api/orders";
import { userReviewsApi } from "@/core/api/reviews";
import type { Order } from "@/core/api/orders/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import { useAppSelector } from "@/app/store";
import ScrollView from "@/foundation/components/scroll/ScrollView";

type ReviewFormState = {
  rating: number;
  comment: string;
};

type ReviewTarget = {
  lineId: string;
  productId: string;
  name: string;
  quantity: number;
  price?: number;
  image?: string;
  isReviewed?: boolean;
};

const OrderReview = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forms, setForms] = useState<Record<string, ReviewFormState>>({});

  const user = useAppSelector(selectUser);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await userOrdersApi.getOrder(orderId);

      if (response.success && response.data) {
        setOrder(response.data as unknown as Order);
      } else {
        setError(response.message || "Không thể tải thông tin đơn hàng");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải thông tin đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId, fetchOrderDetail]);

  const normalizedProducts = useMemo<ReviewTarget[]>(() => {
    if (!order) return [];

    const itemsSource =
      (order as any).orderItems?.length ? (order as any).orderItems : order.items || [];

    return itemsSource.map((item: any, index: number) => {
      const rawProduct = item.productId || item.product || null;
      const productId =
        typeof rawProduct === "string"
          ? rawProduct
          : rawProduct?._id || item.productId || `product-${index}`;
      const productName =
        rawProduct?.name || item.productName || `Sản phẩm ${index + 1}`;
      const productImages = rawProduct?.images || [];
      const firstImage = Array.isArray(productImages) ? productImages[0] : undefined;
      const imageUrl =
        typeof firstImage === "string" ? firstImage : firstImage?.url;
      const isReviewed = Boolean(item.isReviewed);

      return {
        lineId: item._id || `${productId}-${index}`,
        productId,
        name: productName,
        quantity: item.quantity || 1,
        price: item.totalPrice ?? item.price,
        image: imageUrl,
        isReviewed,
      };
    });
  }, [order]);

  useEffect(() => {
    if (!normalizedProducts.length) return;
    setForms((prev) => {
      const next = { ...prev };
      normalizedProducts.forEach((target) => {
        if (target.isReviewed) {
          return;
        }
        if (!next[target.lineId]) {
          next[target.lineId] = { rating: 0, comment: "" };
        }
      });
      return next;
    });
  }, [normalizedProducts]);

  const pendingProducts = useMemo(
    () => normalizedProducts.filter((target) => !target.isReviewed),
    [normalizedProducts]
  );
  const hasPendingReviews = pendingProducts.length > 0;

  const shopId =
    typeof order?.shopId === "string"
      ? order.shopId
      : (order?.shopId as any)?._id;
  const shopName =
    typeof order?.shopId === "object"
      ? (order?.shopId as any)?.name
      : undefined;
  const shippingInfo = (order as any)?.shippingAddress || (order as any)?.addressId || {};
  const receiverName =
    shippingInfo.name ||
    shippingInfo.fullName ||
    (order as any)?.user?.name ||
    "—";
  const receiverPhone =
    shippingInfo.phone ||
    shippingInfo.mobile ||
    (order as any)?.user?.phone ||
    "—";
  const receiverAddress =
    [shippingInfo.address, shippingInfo.ward, shippingInfo.district, shippingInfo.city]
      .filter(Boolean)
      .join(", ") || "—";

  const handleRatingChange = (lineId: string, rating: number) => {
    setForms((prev) => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        rating,
      },
    }));
  };

  const handleCommentChange = (lineId: string, comment: string) => {
    setForms((prev) => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        comment,
      },
    }));
  };

  const handleSubmitReviews = async () => {
    if (!order || !orderId) return;
    if (!shopId) {
      dispatch(
        addToast({
          type: "error",
          message: "Không xác định được cửa hàng để đánh giá",
        })
      );
      return;
    }
    if (!pendingProducts.length) {
      dispatch(
        addToast({
          type: "info",
          message: "Tất cả sản phẩm trong đơn đã được đánh giá",
        })
      );
      return;
    }
    const invalidTargets = pendingProducts.filter(
      (target) => !forms[target.lineId]?.rating
    );
    if (invalidTargets.length) {
      dispatch(
        addToast({
          type: "warning",
          message: "Vui lòng đánh giá tất cả sản phẩm trong đơn",
        })
      );
      return;
    }
    setIsSubmitting(true);
    try {
      for (const target of pendingProducts) {
        const form = forms[target.lineId];
        await userReviewsApi.createReview(target.productId, {
          rating: form.rating,
          comment: form.comment?.trim() || undefined,
          shopId,
          orderId,
          orderItemId: target.lineId,
        });
      }
      dispatch(
        addToast({
          type: "success",
          message: "Cảm ơn bạn đã đánh giá sản phẩm!",
        })
      );
      navigate("/profile?tab=orders");
    } catch (err) {
      dispatch(
        addToast({
          type: "error",
          message:
            err instanceof Error
              ? err.message
              : "Không thể gửi đánh giá. Vui lòng thử lại.",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToOrders = () => {
    navigate("/profile?tab=orders");
  };


  console.log(order);

  if (!orderId) {
    return (
      <Section className="space-y-6">
        <Button
          variant="outline"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={handleBackToOrders}
          className="w-fit"
        >
          Quay lại đơn hàng
        </Button>
        <Empty
          title="Không tìm thấy đơn hàng"
          description="Vui lòng chọn một đơn đã nhận hàng để đánh giá."
        />
      </Section>
    );
  }

  if (loading) {
    return (
      <Section>
        <Loading layout="centered" message="Đang tải đơn hàng..." />
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="space-y-4">
        <Button
          variant="outline"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={handleBackToOrders}
          className="w-fit"
        >
          Quay lại đơn hàng
        </Button>
        <Empty title="Không thể tải đơn hàng" description={error} />
      </Section>
    );
  }

  if (!order) {
    return null;
  }



  const isDelivered = (order.orderStatus || order.status) === "delivered";

  if (!isDelivered) {
    return (
      <Section className="space-y-4">
        <Button
          variant="outline"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={handleBackToOrders}
          className="w-fit"
        >
          Quay lại đơn hàng
        </Button>
        <AlertMessage
          type="info"
          title="Đơn hàng chưa hoàn tất"
          message="Bạn chỉ có thể đánh giá sau khi đơn hàng đã được giao thành công."
        />
      </Section>
    );
  }

  return (
    <Form.Root>
     <ScrollView className="h-[calc(100vh-100px)]" hideScrollbarY={false}>
     <Section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={handleBackToOrders}
        >
          Quay lại đơn hàng
        </Button>
        <div className="text-right">
          <p className="text-sm text-neutral-5">Mã đơn</p>
          <p className="text-lg font-semibold text-neutral-9">
            {order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}
          </p>
        </div>
      </div>

      <Card className="space-y-4 bg-background-1">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <Store className="w-5 h-5 text-primary-6 mt-1" />
            <div>
              <p className="text-xs uppercase text-neutral-5">Shop</p>
              <p className="font-semibold text-neutral-9">{shopName || "Không xác định"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary-6 mt-1" />
            <div>
              <p className="text-xs uppercase text-neutral-5">Ngày đặt</p>
              <p className="font-semibold text-neutral-9">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString("vi-VN")
                  : "--"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-primary-6 mt-1" />
            <div>
              <p className="text-xs uppercase text-neutral-5">Tổng tiền</p>
              <p className="font-semibold text-primary-6">
                {formatPriceVND(order.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <UserIcon className="w-5 h-5 text-primary-6 mt-1" />
            <div>
              <p className="text-xs uppercase text-neutral-5">Người nhận</p>
              <p className="font-semibold text-neutral-9">{user?.name || receiverName}</p>
              <p className="text-sm text-neutral-6">{user?.phone || receiverPhone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary-6 mt-1" />
            <div>
              <p className="text-xs uppercase text-neutral-5">Địa chỉ</p>
              <p className="text-sm text-neutral-7">{receiverAddress}</p>
            </div>
          </div>
        </div>
      </Card>

      <AlertMessage
        type="info"
        title="Đánh giá sản phẩm bạn đã nhận"
        message="Chia sẻ trải nghiệm thực tế của bạn để cộng đồng mua sắm tốt hơn. Mỗi sản phẩm trong đơn sẽ cần ít nhất một đánh giá sao."
      />
      {!hasPendingReviews && (
        <AlertMessage
          type="success"
          title="Đơn hàng đã được đánh giá"
          message="Bạn đã gửi đánh giá cho tất cả sản phẩm trong đơn này."
        />
      )}

      {normalizedProducts.length === 0 ? (
        <Empty
          title="Không có sản phẩm cần đánh giá"
          description="Đơn hàng này không có thông tin sản phẩm chi tiết."
        />
      ) : (
        <div className="space-y-4">
          {normalizedProducts.map((product) => {
            const form = forms[product.lineId] || { rating: 0, comment: "" };
            const isAlreadyReviewed = Boolean(product.isReviewed);
            return (
              <Card
                key={product.lineId}
                className="space-y-4 border border-border-2 bg-background-1"
              >
                <div className="flex gap-4">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-20 w-20 rounded-xl border border-border-2 object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-border-2 bg-neutral-1">
                      <Package className="h-6 w-6 text-neutral-4" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-semibold text-neutral-9 line-clamp-2">
                        {product.name}
                      </p>
                      <span className="text-xs text-neutral-5">
                        Số lượng: {product.quantity}
                      </span>
                    </div>
                    {product.price !== undefined && (
                      <p className="text-sm text-left font-medium text-primary-6">
                        {formatPriceVND(product.price)}
                      </p>
                    )}
                  </div>
                </div>

                {isAlreadyReviewed ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-700">
                      Bạn đã đánh giá sản phẩm này
                    </p>
                    <p className="text-xs text-neutral-6 mt-1">
                      Nếu cần cập nhật nội dung đánh giá, vui lòng liên hệ bộ phận hỗ trợ khách hàng.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-9 mb-1">
                          Đánh giá của bạn
                        </p>
                        <RatingInput
                          value={form.rating}
                          onChange={(rating) => handleRatingChange(product.lineId, rating)}
                          allowHalf
                          showLabel
                          disabled={isSubmitting}
                        />
                      </div>
                      {!form.rating && (
                        <span className="text-xs text-error font-medium">
                          Cần đánh giá sao
                        </span>
                      )}
                    </div>

                    <TextArea
                      name={`comment-${product.lineId}`}
                      label="Nhận xét chi tiết (không bắt buộc)"
                      placeholder="Chia sẻ điểm bạn thích hoặc chưa hài lòng..."
                      value={form.comment}
                      onChange={(e) => handleCommentChange(product.lineId, e.target.value)}
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <Button
          variant="outline"
          onClick={handleBackToOrders}
          disabled={isSubmitting}
        >
          Bỏ qua
        </Button>
        <Button
          color="blue"
          onClick={handleSubmitReviews}
          disabled={isSubmitting || !hasPendingReviews}
          loading={isSubmitting}
          icon={<Star className="w-4 h-4" />}
        >
          Gửi đánh giá
        </Button>
      </div>
      </Section>
     </ScrollView>
    </Form.Root>
  );
};

export default OrderReview;
