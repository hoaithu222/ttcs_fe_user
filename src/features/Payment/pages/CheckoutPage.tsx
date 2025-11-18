import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingBag, CreditCard } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import Page from "@/foundation/components/layout/Page";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Button from "@/foundation/components/buttons/Button";
import Input from "@/foundation/components/input/Input";
import Loading from "@/foundation/components/loading/Loading";
import { PaymentMethodSelector, PaymentAddressSelector } from "../components";
import Modal from "@/foundation/components/modal/Modal";
import type { Address } from "@/core/api/addresses/type";
import { usePayment } from "../hooks";
import {
  selectCart,
  selectCartItems,
  selectIsCartEmpty,
  selectIsCartLoading,
} from "@/features/Cart/slice/Cart.selector";
import { getCartStart, clearCartStart } from "@/features/Cart/slice/Cart.slice";
import { userOrdersApi } from "@/core/api/orders";
import { addToast } from "@/app/store/slices/toast";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector(selectCart);
  const cartItems = useSelector(selectCartItems);
  const isEmpty = useSelector(selectIsCartEmpty);
  const isCartLoading = useSelector(selectIsCartLoading);

  const {
    paymentMethods,
    isPaymentMethodsLoading,
    getPaymentMethods,
    checkoutData,
    isCheckoutLoading,
    createCheckout,
  } = usePayment();

  // Form state
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [pendingPaymentOrders, setPendingPaymentOrders] = useState<
    Array<{ orderId: string; shopId: string; shopName?: string }>
  >([]);
  const [isMultiShopModalOpen, setIsMultiShopModalOpen] = useState(false);

  const selectedPaymentConfig = useMemo(
    () => paymentMethods.find((method) => method.id === selectedPaymentMethod),
    [paymentMethods, selectedPaymentMethod]
  );

  const shopCount = useMemo(() => {
    const ids = new Set<string>();
    cartItems.forEach((item) => {
      if (typeof item.shopId === "string" && item.shopId) {
        ids.add(item.shopId);
      } else if (typeof item.shopId === "object" && item.shopId) {
        const id = (item.shopId as any)._id || (item.shopId as any).id;
        if (id) ids.add(id);
      }
    });
    return ids.size || (cartItems.length ? 1 : 0);
  }, [cartItems]);

  useEffect(() => {
    dispatch(getCartStart());
    getPaymentMethods();
  }, [dispatch, getPaymentMethods]);

  useEffect(() => {
    if (isEmpty) {
      navigate("/cart");
    }
  }, [isEmpty, navigate]);

  // Handle address selection
  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleSelectOrderForPayment = (orderId: string) => {
    setCreatedOrderId(orderId);
    createCheckout(orderId, selectedPaymentMethod);
    setIsMultiShopModalOpen(false);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!selectedAddress) {
      dispatch(addToast({ type: "error", message: "Vui lòng chọn địa chỉ giao hàng" }));
      return false;
    }
    if (!selectedPaymentMethod) {
      dispatch(addToast({ type: "error", message: "Vui lòng chọn phương thức thanh toán" }));
      return false;
    }
    return true;
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!validateForm()) return;
    if (!cart || !cartItems.length) {
      dispatch(addToast({ type: "error", message: "Giỏ hàng trống" }));
      return;
    }

    setIsCreatingOrder(true);

    try {
      const paymentMethodType =
        selectedPaymentConfig?.type || selectedPaymentMethod || "cod";

      const shopGroups = cartItems.reduce<
        Record<string, { items: typeof cartItems; shopName?: string }>
      >((acc, item) => {
        let shopId: string | undefined;
        let shopName: string | undefined;

        if (typeof item.shopId === "string") {
          shopId = item.shopId;
        } else if (typeof item.shopId === "object" && item.shopId) {
          shopId = (item.shopId as any)._id || (item.shopId as any).id;
          shopName = (item.shopId as any).name;
        }

        if (!shopId) return acc;

        if (!acc[shopId]) {
          acc[shopId] = { items: [], shopName };
        }
        acc[shopId].items.push(item);
        return acc;
      }, {});

      const shopEntries = Object.entries(shopGroups);

      if (!shopEntries.length) {
        throw new Error("Không tìm thấy cửa hàng hợp lệ trong giỏ hàng");
      }

      const shippingFeePerShop =
        (cart.shippingFee || 0) / Math.max(1, shopEntries.length);

      const createdOrders: Array<{
        orderId: string;
        shopId: string;
        shopName?: string;
      }> = [];

      const getItemPrice = (item: (typeof cartItems)[number]) =>
        item.finalPrice || item.priceAtTime || item.productPrice || 0;

      for (const [shopId, group] of shopEntries) {
        const orderItems = group.items.map((item) => {
          const productId =
            typeof item.productId === "string"
              ? item.productId
              : typeof item.productId === "object" && item.productId
                ? (item.productId as any)._id || (item.productId as any).id || ""
                : "";

          const variantId =
            typeof item.variantId === "string"
              ? item.variantId
              : typeof item.variantId === "object" && item.variantId
                ? (item.variantId as any)._id || (item.variantId as any).id
                : undefined;

          const price = getItemPrice(item);

          const orderItem: any = {
            productId,
            quantity: item.quantity,
            price,
            totalPrice: price * item.quantity,
            discount: 0,
            tax: 0,
          };

          if (variantId) {
            orderItem.variantId = variantId;
          }

          return orderItem;
        });

        const orderRequest: any = {
          shopId,
          addressId: selectedAddress!._id,
          paymentMethod: paymentMethodType,
          shippingFee: shippingFeePerShop,
          items: orderItems,
          notes: notes.trim() || undefined,
          voucherId: undefined,
        };

        const response = await userOrdersApi.createOrder(orderRequest);

        if (!response.success || !response.data?._id) {
          throw new Error(response.message || "Không thể tạo đơn hàng");
        }

        createdOrders.push({
          orderId: response.data._id,
          shopId,
          shopName: group.shopName,
        });
      }

      dispatch(clearCartStart());
      setPendingPaymentOrders(createdOrders.length > 1 ? createdOrders : []);

      if (createdOrders.length === 1) {
        const orderId = createdOrders[0].orderId;
        setCreatedOrderId(orderId);
        createCheckout(orderId, selectedPaymentMethod);
      } else {
        setCreatedOrderId(null);
        if (paymentMethodType === "cod") {
          setPendingPaymentOrders([]);
          createdOrders.forEach((order) =>
            createCheckout(order.orderId, selectedPaymentMethod)
          );
          dispatch(
            addToast({
              type: "success",
              message: `Đã tạo ${createdOrders.length} đơn hàng (mỗi shop một đơn).`,
            })
          );
          navigate("/orders");
        } else {
          setIsMultiShopModalOpen(true);
          dispatch(
            addToast({
              type: "info",
              message: "Đã tạo đơn hàng cho từng shop. Vui lòng chọn đơn để thanh toán.",
            })
          );
        }
      }
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng",
        })
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Redirect to payment page when checkout succeeds
  useEffect(() => {
    if (checkoutData?.paymentId && createdOrderId) {
      const paymentUrl = checkoutData.paymentUrl;
      
      // Check if paymentUrl is an external gateway URL (contains gateway domain)
      const isExternalGateway = paymentUrl && 
        (paymentUrl.includes('vnpayment.vn') ||
         paymentUrl.includes('momo.vn') ||
         paymentUrl.includes('zalopay.vn') ||
         paymentUrl.includes('paypal.com') ||
         paymentUrl.includes('sandbox.vnpayment.vn'));
      
      if (isExternalGateway && paymentUrl) {
        // Redirect to external payment gateway
        window.location.href = paymentUrl;
      } else {
        // Navigate to frontend payment page with orderId
        navigate(`/payment/${createdOrderId}`);
      }
    }
  }, [checkoutData, createdOrderId, navigate]);

  if (isCartLoading || isEmpty) {
    return (
      <Page>
        <div className="container mx-auto px-4 py-8">
          <Loading layout="centered" message="Đang tải..." />
        </div>
      </Page>
    );
  }

  const subtotal = cart?.subtotal || 0;
  const discount = cart?.discount || 0;
  const couponDiscount = cart?.couponDiscount || 0;
  const shippingFee = cart?.shippingFee || 0;
  const totalAmount = cart?.totalAmount || subtotal - discount - couponDiscount + shippingFee;

  return (
    <Page>
      <div className="min-h-screen bg-background-1">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary-6">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-9">Thanh toán</h1>
              <p className="text-sm text-neutral-6">
                {cart?.itemCount || 0} sản phẩm trong giỏ hàng
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <PaymentAddressSelector
                selectedAddressId={selectedAddress?._id}
                onSelectAddress={handleAddressSelect}
              />

              {/* Notes */}
              <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
                <SectionTitle className="mb-4">Ghi chú đơn hàng (tùy chọn)</SectionTitle>
                <Form.Root onSubmit={(e) => e.preventDefault()}>
                  <Input
                    name="notes"
                    label="Ghi chú"
                    placeholder="Ghi chú cho người bán..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Form.Root>
              </Section>

              {/* Payment Method */}
              <PaymentMethodSelector
                methods={paymentMethods}
                selectedMethod={selectedPaymentMethod}
                onSelectMethod={setSelectedPaymentMethod}
                isLoading={isPaymentMethodsLoading}
              />
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Section className="bg-background-2 rounded-2xl p-6 border border-border-1 sticky top-4">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-5 h-5 text-primary-6" />
                  <SectionTitle>Tóm tắt đơn hàng</SectionTitle>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-6">Tạm tính</span>
                    <span className="text-base font-semibold text-neutral-9">
                      {formatPriceVND(subtotal)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-6">Giảm giá</span>
                      <span className="text-base font-semibold text-success">
                        -{formatPriceVND(discount)}
                      </span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-6">Mã giảm giá</span>
                      <span className="text-base font-semibold text-success">
                        -{formatPriceVND(couponDiscount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-6">Phí vận chuyển</span>
                    <span className="text-base font-semibold text-neutral-9">
                      {shippingFee > 0 ? formatPriceVND(shippingFee) : "Miễn phí"}
                    </span>
                  </div>

                  <div className="h-px bg-border-1" />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-neutral-9">Tổng cộng</span>
                    <span className="text-2xl font-bold text-primary-6">
                      {formatPriceVND(totalAmount)}
                    </span>
                  </div>

                  {shopCount > 1 && (
                    <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
                      Giỏ hàng của bạn thuộc {shopCount} cửa hàng. Hệ thống sẽ tạo{" "}
                      {shopCount} đơn hàng riêng biệt và cần thanh toán theo từng shop.
                    </div>
                  )}
                </div>

                <Button
                  color="blue"
                  variant="solid"
                  size="lg"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={isCreatingOrder || isCheckoutLoading || !selectedPaymentMethod || !selectedAddress}
                  loading={isCreatingOrder || isCheckoutLoading}
                >
                  Xác nhận đặt hàng
                </Button>

                <p className="mt-4 text-xs text-center text-neutral-6">
                  Bằng cách đặt hàng, bạn đồng ý với{" "}
                  <a href="/terms" className="text-primary-6 hover:underline">
                    Điều khoản sử dụng
                  </a>{" "}
                  của chúng tôi
                </p>
              </Section>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={isMultiShopModalOpen}
        onOpenChange={setIsMultiShopModalOpen}
        title="Chọn đơn hàng để thanh toán"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-6">
            Mỗi shop tương ứng một đơn hàng riêng. Vui lòng chọn đơn mà bạn muốn thanh toán ngay hoặc
            truy cập trang <Link to="/orders" className="text-primary-6 hover:underline">Đơn hàng của tôi</Link>{" "}
            để thanh toán sau.
          </p>

          <div className="space-y-3">
            {pendingPaymentOrders.map((order) => (
              <div
                key={order.orderId}
                className="flex items-center justify-between rounded-xl border border-border-1 bg-background-1 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-9">
                    {order.shopName || "Cửa hàng"} • <span className="text-primary-6">#{order.orderId.slice(-6)}</span>
                  </p>
                  <p className="text-xs text-neutral-6">
                    Mã đơn đầy đủ: <span className="font-mono text-neutral-8">{order.orderId}</span>
                  </p>
                </div>
                <Button
                  color="blue"
                  size="sm"
                  onClick={() => handleSelectOrderForPayment(order.orderId)}
                  disabled={isCheckoutLoading && createdOrderId === order.orderId}
                  loading={isCheckoutLoading && createdOrderId === order.orderId}
                >
                  Thanh toán
                </Button>
              </div>
            ))}
          </div>

          {pendingPaymentOrders.length === 0 && (
            <p className="text-xs text-neutral-5">
              Không có đơn hàng nào cần thanh toán.
            </p>
          )}
        </div>
      </Modal>
    </Page>
  );
};

export default CheckoutPage;

