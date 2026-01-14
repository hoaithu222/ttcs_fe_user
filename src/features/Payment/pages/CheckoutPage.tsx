import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingBag, CreditCard, Package, Store, Wallet, Building2, Truck, Tag, AlertCircle, ArrowRight } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import Page from "@/foundation/components/layout/Page";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Button from "@/foundation/components/buttons/Button";
import Input from "@/foundation/components/input/Input";
import Loading from "@/foundation/components/loading/Loading";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import { PaymentAddressSelector } from "../components";
import Modal from "@/foundation/components/modal/Modal";
import type { Address } from "@/core/api/addresses/type";
import type { PaymentMethod } from "@/core/api/payments/type";
import { usePayment } from "../hooks";
import {
  selectCart,
  selectCartItems,
  selectIsCartEmpty,
  selectIsCartLoading,
} from "@/features/Cart/slice/Cart.selector";
import { getCartStart } from "@/features/Cart/slice/Cart.slice";
import { userOrdersApi } from "@/core/api/orders";
import { userWalletApi } from "@/core/api/wallet";
import { addToast } from "@/app/store/slices/toast";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import { getCartItemVariantInfo } from "@/features/Cart/utils/cartVariant.helpers";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const cart = useSelector(selectCart);
  const allCartItems = useSelector(selectCartItems);
  const isEmpty = useSelector(selectIsCartEmpty);
  const isCartLoading = useSelector(selectIsCartLoading);

  // Get state from navigation (buyNow or selectedItemIds)
  const buyNowData = (location.state as any)?.buyNow ? (location.state as any)?.product : null;
  const selectedItemIds = (location.state as any)?.selectedItemIds as string[] | undefined;
  const shopIdFilter = (location.state as any)?.shopId as string | undefined;

  // Filter cart items based on selection or use buyNow data
  const cartItems = useMemo(() => {
    // If buyNow, create a virtual cart item
    if (buyNowData) {
      return [
        {
          _id: `buy-now-${Date.now()}`,
          productId: buyNowData.productId,
          variantId: buyNowData.variantId,
          quantity: buyNowData.quantity,
          priceAtTime: buyNowData.price,
          finalPrice: buyNowData.price,
          productPrice: buyNowData.price,
          totalPrice: buyNowData.price * buyNowData.quantity,
          shopId: buyNowData.shopId,
          shopName: buyNowData.shopName || "",
          productName: buyNowData.productName || "Sản phẩm",
          productImage: buyNowData.productImage || "",
        } as any,
      ];
    }

    // If selectedItemIds provided, filter by them
    if (selectedItemIds && selectedItemIds.length > 0) {
      return allCartItems.filter((item) => selectedItemIds.includes(item._id));
    }

    // If shopIdFilter provided, filter by shop
    if (shopIdFilter) {
      return allCartItems.filter((item) => {
        const itemShopId =
          typeof item.shopId === "string"
            ? item.shopId
            : typeof item.shopId === "object" && item.shopId
              ? item.shopId._id
              : "";
        return itemShopId === shopIdFilter;
      });
    }

    // Default: use all cart items
    return allCartItems;
  }, [buyNowData, selectedItemIds, shopIdFilter, allCartItems]);

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

  // Wallet state
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

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

  // Load wallet balance
  const loadWalletBalance = async () => {
    try {
      const response = await userWalletApi.getBalance();
      if (response.success && response.data) {
        setWalletBalance(response.data.balance || 0);
      }
    } catch (error) {
      console.error("Failed to load wallet balance:", error);
    }
  };

  useEffect(() => {
    dispatch(getCartStart());
    getPaymentMethods();
    loadWalletBalance();
  }, [dispatch, getPaymentMethods]);

  // Don't redirect to cart if we're in the process of creating an order or using buyNow
  // Backend removes cart items after order creation, which would trigger this redirect
  useEffect(() => {
    if (isEmpty && !isCreatingOrder && !createdOrderId && !buyNowData) {
      console.log("[CheckoutPage] Cart is empty and not creating order, redirecting to /cart");
      navigate("/cart");
    }
  }, [isEmpty, navigate, isCreatingOrder, createdOrderId, buyNowData]);

  // Debug: Log checkoutData changes
  useEffect(() => {
    console.log("[CheckoutPage] checkoutData changed:", {
      checkoutData,
      paymentId: checkoutData?.paymentId,
      qrCode: checkoutData?.qrCode,
      instructions: checkoutData?.instructions,
    });
  }, [checkoutData]);

  // Debug: Log createdOrderId changes
  useEffect(() => {
    console.log("[CheckoutPage] createdOrderId changed:", createdOrderId);
  }, [createdOrderId]);

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

    // Check wallet balance if wallet payment method is selected
    if (selectedPaymentConfig?.type === "wallet") {
      if (walletBalance === null) {
        dispatch(addToast({ type: "error", message: "Đang kiểm tra số dư ví..." }));
        return false;
      }
      if (walletBalance < totalAmount) {
        dispatch(addToast({
          type: "error",
          message: `Số dư ví không đủ. Số dư hiện tại: ${formatPriceVND(walletBalance)}. Vui lòng nạp thêm tiền.`
        }));
        setIsDepositModalOpen(true);
        return false;
      }
    }

    return true;
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!validateForm()) return;
    // For buyNow, cart can be empty/null, so only check cartItems
    if (!cartItems.length) {
      dispatch(addToast({ type: "error", message: buyNowData ? "Không có sản phẩm để thanh toán" : "Giỏ hàng trống" }));
      return;
    }
    // Only check cart if not using buyNow
    if (!buyNowData && (!cart || isEmpty)) {
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

      // Calculate shipping fee per shop
      const checkoutSubtotal = cartItems.reduce((sum, item) => {
        const price = item.finalPrice || item.priceAtTime || item.productPrice || 0;
        return sum + price * item.quantity;
      }, 0);
      const shippingFeePerShop = checkoutSubtotal >= 500000 ? 0 : 30000;

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

        console.log("[CheckoutPage] Creating order for shop:", {
          shopId,
          shopName: group.shopName,
          paymentMethod: paymentMethodType,
          itemCount: orderItems.length,
        });

        const response = await userOrdersApi.createOrder(orderRequest);

        console.log("[CheckoutPage] Order creation response:", {
          success: response.success,
          orderId: response.data?._id,
          message: response.message,
        });

        if (!response.success || !response.data?._id) {
          throw new Error(response.message || "Không thể tạo đơn hàng");
        }

        createdOrders.push({
          orderId: response.data._id,
          shopId,
          shopName: group.shopName,
        });

        console.log("[CheckoutPage] Order added to createdOrders:", {
          orderId: response.data._id,
          totalCreated: createdOrders.length,
        });
      }

      // Don't refresh cart immediately after order creation
      // Backend already removes ordered items from cart
      // We'll refresh cart later after redirect to avoid isEmpty check redirecting to /cart
      // if (!buyNowData) {
      //   console.log("[CheckoutPage] Refreshing cart...");
      //   dispatch(getCartStart());
      // }
      setPendingPaymentOrders(createdOrders.length > 1 ? createdOrders : []);

      if (createdOrders.length === 1) {
        const orderId = createdOrders[0].orderId;
        console.log("[CheckoutPage] Single order created:", {
          orderId,
          paymentMethod: selectedPaymentMethod,
          paymentMethodType: selectedPaymentConfig?.type,
        });
        setCreatedOrderId(orderId);
        console.log("[CheckoutPage] Calling createCheckout...");
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
          navigate("/profile?tab=orders");
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
      console.log("[CheckoutPage] Error creating order:", error);
      dispatch(
        addToast({
          type: "error",
          message: error?.message || "Có lỗi xảy ra khi tạo đơn hàng",
        })
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Redirect to payment page when checkout succeeds
  useEffect(() => {
    console.log("[CheckoutPage] Redirect useEffect triggered:", {
      checkoutData,
      paymentId: checkoutData?.paymentId,
      createdOrderId,
      selectedPaymentConfig,
      methodType: selectedPaymentConfig?.type,
    });

    if (checkoutData?.paymentId && createdOrderId) {
      const methodType = selectedPaymentConfig?.type;
      console.log("[CheckoutPage] Conditions met for redirect:", {
        methodType,
        willRedirectToPayment: methodType === "wallet" || methodType === "bank_transfer",
        willRedirectToResult: methodType !== "wallet" && methodType !== "bank_transfer",
      });

      // Với các phương thức cần thanh toán online (wallet, bank_transfer) -> sang màn thanh toán
      if (methodType === "wallet" || methodType === "bank_transfer") {
        console.log("[CheckoutPage] Redirecting to payment page:", `/payment/${createdOrderId}`);
        navigate(`/payment/${createdOrderId}`);
      } else {
        // Với COD hoặc phương thức khác -> sang màn cảm ơn
        console.log("[CheckoutPage] Redirecting to result page:", `/payment/result/${createdOrderId}`);
        navigate(`/payment/result/${createdOrderId}`);
      }
    } else {
      console.log("[CheckoutPage] Redirect conditions not met:", {
        hasCheckoutData: !!checkoutData,
        hasPaymentId: !!checkoutData?.paymentId,
        hasCreatedOrderId: !!createdOrderId,
      });
    }
  }, [checkoutData, createdOrderId, navigate, selectedPaymentConfig]);

  // Calculate totals based on filtered cartItems (selected items or buyNow)
  const calculatedSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.finalPrice || item.priceAtTime || item.productPrice || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const subtotal = buyNowData ? calculatedSubtotal : cart?.subtotal || calculatedSubtotal;
  const discount = cart?.discount || 0;
  const couponDiscount = cart?.couponDiscount || 0;
  // Calculate shipping fee: free if subtotal >= 500000, otherwise 30000 per shop
  const shippingFeePerShop = calculatedSubtotal >= 500000 ? 0 : 30000;
  const shopCountForShipping = useMemo(() => {
    const shopIds = new Set<string>();
    cartItems.forEach((item) => {
      const shopId =
        typeof item.shopId === "string"
          ? item.shopId
          : typeof item.shopId === "object" && item.shopId
            ? (item.shopId as any)._id || (item.shopId as any).id
            : "";
      if (shopId) shopIds.add(shopId);
    });
    return shopIds.size || 1;
  }, [cartItems]);
  const shippingFee = buyNowData
    ? shippingFeePerShop
    : cart?.shippingFee || shippingFeePerShop * shopCountForShipping;
  const totalAmount = subtotal - discount - couponDiscount + shippingFee;

  if ((isCartLoading && !buyNowData) || (isEmpty && !buyNowData && !selectedItemIds)) {
    return (
      <Page>
        <div className="container mx-auto px-4 py-8">
          <Loading layout="centered" message="Đang tải..." />
        </div>
      </Page>
    );
  }

  // Check if wallet payment is selected and balance is insufficient
  const isWalletSelected = selectedPaymentConfig?.type === "wallet";
  const isWalletInsufficient = isWalletSelected && walletBalance !== null && walletBalance < totalAmount;

  return (
    <Page>
      <div className="min-h-screen bg-background-1">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-primary-6 shadow-lg shadow-primary-6/20">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-9 mb-1">Thanh toán</h1>
              <p className="text-sm text-neutral-6">
                {cart?.itemCount || cartItems.length || 0} sản phẩm trong giỏ hàng
              </p>
            </div>
          </div>

          <div className="container mx-auto">
            <div className="space-y-6">
              {/* Shipping Address */}
              <PaymentAddressSelector
                selectedAddressId={selectedAddress?._id}
                onSelectAddress={handleAddressSelect}
              />

              {/* Order Summary */}
              <Section className="bg-background-2 rounded-2xl p-8 border border-border-1 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-1">
                    <ShoppingBag className="w-5 h-5 text-primary-6" />
                  </div>
                  <SectionTitle className="text-xl">Thông tin đơn hàng</SectionTitle>
                </div>

                {/* Shop and Products Section */}
                <div className="mb-8">
                  <h3 className="text-base text-start font-semibold text-neutral-9 mb-4 flex items-center gap-2">
                    <Store className="w-5 h-5 text-primary-6" />
                    Sản phẩm đang thanh toán
                  </h3>
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                    {(() => {
                      // Group items by shop
                      const shopGroups = cartItems.reduce<
                        Record<string, { shopName: string; items: typeof cartItems }>
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
                          acc[shopId] = { shopName: shopName || item.shopName || "Cửa hàng", items: [] };
                        }
                        acc[shopId].items.push(item);
                        return acc;
                      }, {});

                      return Object.entries(shopGroups).map(([shopId, group]) => (
                        <div
                          key={shopId}
                          className="border border-border-1 rounded-xl p-5 bg-background-1 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-1">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-1">
                              <Store className="w-4 h-4 text-primary-6" />
                            </div>
                            <span className="text-sm font-semibold text-neutral-9">{group.shopName}</span>
                            <span className="ml-auto text-xs text-neutral-6">
                              {group.items.length} sản phẩm
                            </span>
                          </div>
                          <div className="space-y-4">
                            {group.items.map((item) => {
                              const variantInfo = getCartItemVariantInfo(item);
                              const productImage = variantInfo.image || item.productImage || "";
                              const productName = item.productName || "Sản phẩm";
                              const finalPrice = item.finalPrice || item.productPrice || item.priceAtTime || 0;
                              const itemTotal = item.totalPrice || finalPrice * item.quantity;
                              const variantAttributes =
                                variantInfo.attributes && Object.keys(variantInfo.attributes).length > 0
                                  ? variantInfo.attributes
                                  : undefined;

                              return (
                                <div
                                  key={item._id}
                                  className="flex gap-4 p-4 bg-background-2 rounded-xl border border-border-1 hover:border-primary-3 transition-all duration-200"
                                >
                                  <div className="flex-shrink-0">
                                    {productImage ? (
                                      <img
                                        src={productImage}
                                        alt={productName}
                                        className="w-20 h-20 rounded-xl object-cover border border-border-1 shadow-sm"
                                      />
                                    ) : (
                                      <div className="flex justify-center items-center w-20 h-20 rounded-xl bg-neutral-2 border border-border-1">
                                        <Package className="w-6 h-6 text-neutral-4" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-start font-semibold text-neutral-9 line-clamp-2 mb-2 leading-snug">
                                      {productName}
                                    </p>
                                    {(variantInfo.sku || variantAttributes) && (
                                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                        {variantInfo.sku && (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-1 text-primary-7 text-[11px] font-medium border border-primary-3">
                                            <Tag className="w-3 h-3" />
                                            {variantInfo.sku}
                                          </span>
                                        )}
                                        {variantAttributes &&
                                          Object.entries(variantAttributes).map(([key, value]) => (
                                            <span
                                              key={key}
                                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-1 text-neutral-7 text-[11px] border border-border-1"
                                            >
                                              <span className="font-medium text-neutral-8">{key}:</span> {value}
                                            </span>
                                          ))}
                                      </div>
                                    )}
                                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-border-1">
                                      <div className="flex items-center gap-4 text-xs text-neutral-6">
                                        <span>
                                          SL: <span className="font-semibold text-neutral-9 ml-1">{item.quantity}</span>
                                        </span>
                                        <span>
                                          Đơn giá: <span className="font-semibold text-neutral-9 ml-1">{formatPriceVND(finalPrice)}</span>
                                        </span>
                                      </div>
                                      <span className="text-base font-bold text-primary-6">
                                        {formatPriceVND(itemTotal)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="h-px bg-border-1 my-8" />

                {/* Notes Section */}
                <div className="mb-8">
                  <SectionTitle className="mb-4 text-base flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary-6" />
                    Ghi chú đơn hàng
                  </SectionTitle>
                  <Form.Root onSubmit={(e) => e.preventDefault()}>
                    <Input
                      name="notes"
                      label=""
                      placeholder="Ghi chú cho người bán (tùy chọn)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="text-sm"
                    />
                  </Form.Root>
                </div>

                <div className="h-px bg-border-1 my-8" />

                {/* Payment Method Section */}
                <div className="mb-8">
                  <SectionTitle className="mb-5 text-base flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary-6" />
                    Phương thức thanh toán
                  </SectionTitle>
                  {isPaymentMethodsLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-16 bg-neutral-2 animate-pulse rounded-lg border border-border-1"
                        />
                      ))}
                    </div>
                  ) : paymentMethods.filter((m) => m.isActive).length === 0 ? (
                    <p className="text-sm text-neutral-6">Không có phương thức thanh toán nào khả dụng</p>
                  ) : (
                    <div className="space-y-3">
                      {paymentMethods
                        .filter((method) => method.isActive)
                        .map((method) => {
                          const getMethodIcon = (type: PaymentMethod["type"]) => {
                            switch (type) {
                              case "bank_transfer":
                                return <Building2 className="w-4 h-4" />;
                              case "cod":
                                return <Truck className="w-4 h-4" />;
                              case "wallet":
                              default:
                                return <Wallet className="w-4 h-4" />;
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

                          // Check if this is wallet method and show balance
                          const isWalletMethod = method.type === "wallet";
                          const showWalletBalance = isWalletMethod && walletBalance !== null;
                          const walletInsufficient = isWalletMethod && walletBalance !== null && walletBalance < totalAmount;

                          return (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => setSelectedPaymentMethod(method.id)}
                              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedPaymentMethod === method.id
                                ? "border-primary-6 bg-primary-1 shadow-sm"
                                : "border-border-1 bg-background-1 hover:border-primary-3 hover:shadow-sm"
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`flex justify-center items-center w-8 h-8 rounded ${selectedPaymentMethod === method.id
                                    ? "bg-primary-6 text-white"
                                    : "bg-neutral-2 text-neutral-7"
                                    }`}
                                >
                                  {getMethodIcon(method.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-neutral-9">
                                    {getMethodLabel(method.type)}
                                  </p>
                                  {showWalletBalance && (
                                    <p className={`text-xs mt-0.5 ${walletInsufficient ? "text-error" : "text-neutral-6"}`}>
                                      Số dư: {formatPriceVND(walletBalance)}
                                      {walletInsufficient && " (Không đủ)"}
                                    </p>
                                  )}
                                  {!showWalletBalance && method.description && (
                                    <p className="text-xs text-neutral-6 mt-0.5 line-clamp-1">
                                      {method.description}
                                    </p>
                                  )}
                                </div>
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedPaymentMethod === method.id
                                    ? "border-primary-6 bg-primary-6"
                                    : "border-neutral-4 bg-transparent"
                                    }`}
                                >
                                  {selectedPaymentMethod === method.id && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>

                <div className="h-px bg-border-1 my-8" />

                {/* Order Summary Pricing */}
                <div className="space-y-4 mb-8">
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
                    <AlertMessage
                      type="info"
                      compact
                      className="mt-3"
                      title="Nhiều cửa hàng trong đơn hàng"
                      message={
                        <>
                          Giỏ hàng của bạn thuộc <strong>{shopCount}</strong> cửa hàng. Hệ thống sẽ tạo
                          riêng từng đơn cho mỗi shop và bạn cần thanh toán theo từng shop.
                        </>
                      }
                    />
                  )}

                  {isWalletInsufficient && (
                    <AlertMessage
                      type="warning"
                      compact
                      className="mt-3"
                      title="Số dư ví không đủ"
                      message={
                        <>
                          Số dư ví hiện tại không đủ để thanh toán. Vui lòng nạp thêm{" "}
                          <strong>{formatPriceVND(totalAmount - (walletBalance || 0))}</strong> để tiếp tục.
                        </>
                      }
                    />
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
                  className="mt-2"
                >
                  Xác nhận đặt hàng
                </Button>

                <p className="mt-6 text-xs text-center text-neutral-6">
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
            truy cập trang <Link to="/profile?tab=orders" className="text-primary-6 hover:underline">Đơn hàng của tôi</Link>{" "}
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

      {/* Deposit Modal */}
      <Modal
        open={isDepositModalOpen}
        onOpenChange={setIsDepositModalOpen}
        title={
          <div className="flex items-center gap-3">
            <IconCircleWrapper
              color="warning"
              size="md"
              classNameIcon="text-warning"
            >
              <Wallet className="w-5 h-5" />
            </IconCircleWrapper>
            <span className="text-xl font-semibold text-neutral-9">Nạp tiền vào ví</span>
          </div>
        }
        size="md"
      >
        <div className="space-y-6">
          <AlertMessage
            type="warning"
            title="Số dư ví không đủ"
            message="Bạn cần nạp thêm tiền vào ví để tiếp tục thanh toán đơn hàng này."
            compact={false}
            dismissible={false}
          />

          <div className="space-y-4 rounded-xl border border-border-1 bg-background-1 p-5">
            <div className="flex items-center justify-between py-2 border-b border-border-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-1">
                  <Wallet className="w-4 h-4 text-neutral-6" />
                </div>
                <span className="text-sm font-medium text-neutral-7">Số dư hiện tại</span>
              </div>
              <span className="text-base font-bold text-neutral-9">
                {formatPriceVND(walletBalance || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-1">
                  <ShoppingBag className="w-4 h-4 text-primary-6" />
                </div>
                <span className="text-sm font-medium text-neutral-7">Số tiền cần thanh toán</span>
              </div>
              <span className="text-base font-bold text-primary-6">
                {formatPriceVND(totalAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-error/10">
                  <AlertCircle className="w-4 h-4 text-error" />
                </div>
                <span className="text-sm font-medium text-neutral-7">Cần nạp thêm</span>
              </div>
              <span className="text-lg font-bold text-error">
                {formatPriceVND(Math.max(0, totalAmount - (walletBalance || 0)))}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDepositModalOpen(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              variant="solid"
              onClick={() => {
                setIsDepositModalOpen(false);
                navigate(`/wallet/deposit?walletType=user&returnUrl=${encodeURIComponent("/checkout")}`);
              }}

              className="flex-1 flex items-center justify-center gap-2"
            >
              Đi đến nạp tiền
            </Button>
          </div>
        </div>
      </Modal>
    </Page>
  );
};

export default CheckoutPage;

