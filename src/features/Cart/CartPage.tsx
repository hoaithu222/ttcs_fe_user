import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingCart, Trash2 } from "lucide-react";
import Page from "@/foundation/components/layout/Page";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import ConfirmModal from "@/foundation/components/modal/ModalConfirm";
import { CartList, CartSummary } from "./components";
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
} from "./slice/Cart.selector";
import { ReduxStateType } from "@/app/store/types";
import type { CartItem as CartItemType } from "@/core/api/cart/type";
import type { ProductVariant } from "@/core/api/products/type";
import { addToast } from "@/app/store/slices/toast";
import { useAppDispatch } from "@/app/store";

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appDispatch = useAppDispatch();
  const [isClearCartModalOpen, setIsClearCartModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [hasInitialized, setHasInitialized] = useState(false);

  const cart = useSelector(selectCart);
  const cartItems = useSelector(selectCartItems);
  const cartStatus = useSelector(selectCartStatus);
  const isLoading = useSelector(selectIsCartLoading);
  const isEmpty = useSelector(selectIsCartEmpty);

  // Auto-select all items when cart loads for the first time
  useEffect(() => {
    if (cartItems.length > 0 && !hasInitialized && selectedItems.size === 0) {
      setSelectedItems(new Set(cartItems.map((item) => item._id)));
      setHasInitialized(true);
    }
  }, [cartItems, hasInitialized, selectedItems.size]);

  // Clean up selectedItems when items are removed from cart
  useEffect(() => {
    const cartItemIds = new Set(cartItems.map((item) => item._id));
    setSelectedItems((prev) => {
      const newSet = new Set<string>();
      prev.forEach((id) => {
        if (cartItemIds.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  }, [cartItems]);

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
    if (selectedItems.size === 0) {
      appDispatch(
        addToast({
          type: "error",
          message: "Vui lòng chọn ít nhất một sản phẩm để thanh toán",
        })
      );
      return;
    }
    navigate("/checkout", { state: { selectedItemIds: Array.from(selectedItems) } });
  };

  const handleCheckoutShop = (shopId: string) => {
    // Get selected items for this shop only
    const shopSelectedItems = cartItems
      .filter((item) => {
        const itemShopId =
          typeof item.shopId === "string"
            ? item.shopId
            : typeof item.shopId === "object" && item.shopId
              ? item.shopId._id
              : "";
        return itemShopId === shopId && selectedItems.has(item._id);
      })
      .map((item) => item._id);

    if (shopSelectedItems.length === 0) {
      appDispatch(
        addToast({
          type: "error",
          message: "Vui lòng chọn ít nhất một sản phẩm của cửa hàng này để thanh toán",
        })
      );
      return;
    }
    navigate("/checkout", { state: { selectedItemIds: shopSelectedItems, shopId } });
  };

  const handleItemSelect = (itemId: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(cartItems.map((item) => item._id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const selectedItemsCount = selectedItems.size;
  const allItemsSelected = useMemo(() => {
    if (cartItems.length === 0) return false;
    return cartItems.every((item) => selectedItems.has(item._id));
  }, [cartItems, selectedItems]);

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
        <div className="container mx-auto px-4 py-10">
          <Loading layout="centered" message="Đang tải giỏ hàng..." />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="min-h-screen bg-background-1">
        <div className="container mx-auto px-4 py-6 lg:py-10">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center w-12 h-12 rounded-2xl bg-primary-6 text-white shadow-sm">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl text-left lg:text-3xl font-bold text-neutral-9">Giỏ hàng</h2>
                <p className="text-sm text-neutral-6">
                  {cart?.itemCount || 0} sản phẩm trong giỏ hàng
                  {selectedItemsCount > 0 && (
                    <span className="ml-2 text-primary-6 font-medium">
                      ({selectedItemsCount} đã chọn)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-2 items-center lg:justify-end">
              {!isEmpty && (
                <>
                  <Button
                    color="gray"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAll(!allItemsSelected)}
                    disabled={isLoading}
                  >
                    {allItemsSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </Button>
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
                </>
              )}
            </div>
          </div>

          {/* Cart Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-background-2 rounded-lg p-4 lg:p-6 shadow-sm border border-border-1">
                <CartList
                  items={cartItems}
                  selectedItems={selectedItems}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                  onRemoveShop={handleRemoveShop}
                  onCheckoutShop={handleCheckoutShop}
                  onVariantChange={handleVariantChange}
                  onItemSelect={handleItemSelect}
                  isLoading={isLoading}
                  onContinueShopping={handleContinueShopping}
                />
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              {cart && (
                <CartSummary
                  cart={cart}
                  selectedItems={selectedItems}
                  cartItems={cartItems}
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
