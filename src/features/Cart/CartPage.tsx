import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingCart, Trash2 } from "lucide-react";
import Page from "@/foundation/components/layout/Page";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import ConfirmModal from "@/foundation/components/modal/ModalConfirm";
import { CartList, CartSummary, CartShopSummary } from "./components";
import {
  getCartStart,
  removeFromCartStart,
  updateQuantityStart,
  clearCartStart,
} from "./slice/Cart.slice";
import {
  selectCart,
  selectCartItems,
  selectCartStatus,
  selectIsCartLoading,
  selectIsCartEmpty,
  selectCartItemsByShop,
} from "./slice/Cart.selector";
import { ReduxStateType } from "@/app/store/types";
import type { CartItem as CartItemType } from "@/core/api/cart/type";
import type { ProductVariant } from "@/core/api/products/type";

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isClearCartModalOpen, setIsClearCartModalOpen] = useState(false);

  const cart = useSelector(selectCart);
  const cartItems = useSelector(selectCartItems);
  const cartStatus = useSelector(selectCartStatus);
  const isLoading = useSelector(selectIsCartLoading);
  const isEmpty = useSelector(selectIsCartEmpty);

  useEffect(() => {
    dispatch(getCartStart());
  }, [dispatch]);

  const handleQuantityChange = (itemId: string, quantity: number) => {
    dispatch(updateQuantityStart({ itemId, quantity }));
  };

  const handleRemove = (itemId: string) => {
    dispatch(removeFromCartStart(itemId));
  };

  const handleVariantChange = (item: CartItemType, variant: ProductVariant) => {
    const product = item.product;
    if (!product) return;
    const variantId = (variant._id as string) || (variant as any)?.id || variant.sku;
    const currentVariantId =
      typeof item.variantId === "string"
        ? item.variantId
        : (item.variantId as any)?._id || (item.variantId as any)?.toString?.();
    if (!variantId || (currentVariantId && variantId === currentVariantId)) return;
    const basePrice = variant.price ?? product.price ?? item.priceAtTime ?? 0;
    const discountPercent = Math.min(Math.max(product.discount ?? 0, 0), 100);
    const finalPrice =
      product.finalPrice && !variant
        ? product.finalPrice
        : basePrice - (basePrice * discountPercent) / 100;
    dispatch(
      updateQuantityStart({
        itemId: item._id,
        variantId,
        priceAtTime: Math.max(0, finalPrice),
      })
    );
  };

  const handleClearCart = () => {
    setIsClearCartModalOpen(true);
  };

  const handleConfirmClearCart = () => {
    dispatch(clearCartStart());
    setIsClearCartModalOpen(false);
  };

  const handleCheckout = () => {
    // TODO: Navigate to checkout page for all shops
    navigate("/checkout");
  };

  const handleCheckoutShop = (shopId: string) => {
    // TODO: Navigate to checkout page for specific shop
    navigate("/checkout", { state: { shopId } });
  };

  const handleRemoveShop = (shopId: string) => {
    const shopItems = cartItems.filter((item) => {
      const itemShopId =
        typeof item.shopId === "string"
          ? item.shopId
          : typeof item.shopId === "object" && item.shopId
          ? item.shopId._id
          : "";
      return itemShopId === shopId;
    });
    shopItems.forEach((item) => {
      dispatch(removeFromCartStart(item._id));
    });
  };

  const handleContinueShopping = () => {
    navigate("/products");
  };

  if (cartStatus === ReduxStateType.LOADING && !cart) {
    return (
      <Page>
        <div className="container mx-auto px-4 py-8">
          <Loading layout="centered" message="Đang tải giỏ hàng..." />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="min-h-screen bg-background-1">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary-6">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-9">Giỏ hàng</h1>
                <p className="text-sm text-neutral-6">
                  {cart?.itemCount || 0} sản phẩm trong giỏ hàng
                </p>
              </div>
            </div>

            {!isEmpty && (
              <Button
                color="red"
                variant="outline"
                size="sm"
                onClick={handleClearCart}
                disabled={isLoading}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Xóa tất cả
              </Button>
            )}
          </div>

          {/* Cart Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Section className="bg-background-2 rounded-2xl p-6 lg:p-8 shadow-sm border border-border-1">
                <SectionTitle className="mb-6">Sản phẩm trong giỏ hàng</SectionTitle>
                <CartList
                  items={cartItems}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                  onRemoveShop={handleRemoveShop}
                  onCheckoutShop={handleCheckoutShop}
                  onVariantChange={handleVariantChange}
                  isLoading={isLoading}
                  onContinueShopping={handleContinueShopping}
                />
              </Section>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              {cart && (
                <CartSummary
                  cart={cart}
                  onCheckout={handleCheckout}
                  onCheckoutShop={handleCheckoutShop}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={isClearCartModalOpen}
        onOpenChange={setIsClearCartModalOpen}
        title="Xóa toàn bộ giỏ hàng"
        content="Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng? Hành động này không thể hoàn tác."
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        iconType="warning"
        onConfirm={handleConfirmClearCart}
        onCancel={() => setIsClearCartModalOpen(false)}
        disabled={isLoading}
      />
    </Page>
  );
};

export default CartPage;
