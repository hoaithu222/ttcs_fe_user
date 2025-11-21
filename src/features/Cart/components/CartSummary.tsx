import React, { useMemo } from "react";
import type { CartItem } from "@/core/api/cart/type";
import { ShoppingBag, Truck, Tag, Store } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { Cart, CartItem } from "@/core/api/cart/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";

interface CartSummaryProps {
  cart: Cart;
  selectedItems?: Set<string>;
  cartItems?: CartItem[];
  onCheckout?: () => void;
  onCheckoutShop?: (shopId: string) => void;
  isLoading?: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  cart,
  selectedItems = new Set(),
  cartItems = [],
  onCheckout,
  onCheckoutShop,
  isLoading = false,
}) => {
  // Calculate totals for selected items only
  const selectedItemsList = useMemo(
    () => cartItems.filter((item) => selectedItems.has(item._id)),
    [cartItems, selectedItems]
  );

  const subtotal = useMemo(() => {
    if (selectedItems.size === 0) return 0;
    return selectedItemsList.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  }, [selectedItemsList, selectedItems.size]);

  const discount = cart.discount || 0;
  const couponDiscount = cart.couponDiscount || 0;
  const shippingFee = cart.shippingFee || 0;
  const totalAmount = subtotal - discount - couponDiscount + shippingFee;

  // Group selected items by shop for summary
  const shopGroups = useMemo(() => {
    const items = selectedItemsList.length > 0 ? selectedItemsList : cartItems;
    const groups = new Map<string, { shopId: string; shopName: string; items: CartItem[] }>();

    items.forEach((item) => {
      // Only include selected items
      if (selectedItems.size > 0 && !selectedItems.has(item._id)) return;

      const shopId =
        typeof item.shopId === "string"
          ? item.shopId
          : typeof item.shopId === "object" && item.shopId
          ? item.shopId._id
          : "";
      const shopName = item.shopName || "Cửa hàng";

      if (!shopId) return; // Skip if no shopId

      if (!groups.has(shopId)) {
        groups.set(shopId, { shopId, shopName, items: [] });
      }

      groups.get(shopId)!.items.push(item);
    });

    return Array.from(groups.values());
  }, [selectedItemsList, cartItems, selectedItems]);

  return (
    <div className="sticky top-4 p-6 bg-background-2 rounded-2xl border border-border-1 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-primary-6/10">
          <ShoppingBag className="w-5 h-5 text-primary-6" />
        </div>
        <h2 className="text-xl font-bold text-neutral-9">Tóm tắt đơn hàng</h2>
      </div>

      <div className="space-y-4 mb-6">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-6">Tạm tính</span>
          <span className="text-base font-semibold text-neutral-9">{formatPriceVND(subtotal)}</span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-6">Giảm giá</span>
            <span className="text-base font-semibold text-success">-{formatPriceVND(discount)}</span>
          </div>
        )}

        {/* Coupon Discount */}
        {couponDiscount > 0 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary-6" />
              <span className="text-sm text-neutral-6">Mã giảm giá</span>
            </div>
            <span className="text-base font-semibold text-success">
              -{formatPriceVND(couponDiscount)}
            </span>
          </div>
        )}

        {/* Shipping Fee */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-neutral-6" />
            <span className="text-sm text-neutral-6">Phí vận chuyển</span>
          </div>
          <span className="text-base font-semibold text-neutral-9">
            {shippingFee > 0 ? formatPriceVND(shippingFee) : "Miễn phí"}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-1" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-neutral-9">Tổng cộng</span>
          <span className="text-2xl font-bold text-primary-6">{formatPriceVND(totalAmount)}</span>
        </div>
      </div>

      {/* Shop Summaries - Show breakdown if multiple shops */}
      {shopGroups.length > 1 && (
        <div className="mt-6 pt-6 border-t border-border-1">
          <h3 className="mb-4 text-sm font-semibold text-neutral-9">Tổng tiền theo shop</h3>
          <div className="space-y-3">
            {shopGroups.map((group) => {
              const shopSubtotal = group.items.reduce(
                (sum, item) => sum + (item.totalPrice || 0),
                0
              );
              const shopItemCount = group.items.reduce((sum, item) => sum + item.quantity, 0);
              return (
                <div
                  key={group.shopId}
                  className="flex justify-between items-center p-3 bg-background-1 rounded-lg border border-border-1"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-9 truncate">
                      {group.shopName}
                    </p>
                    <p className="text-xs text-neutral-6">{shopItemCount} sản phẩm</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-6">
                      {formatPriceVND(shopSubtotal)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Checkout Buttons */}
      <div className="mt-6 space-y-3">
        {onCheckout && (
          <Button
            color="blue"
            variant="solid"
            size="lg"
            fullWidth
            onClick={onCheckout}
            disabled={isLoading || selectedItems.size === 0}
            loading={isLoading}
          >
            {selectedItems.size === 0
              ? "Chọn sản phẩm để thanh toán"
              : shopGroups.length > 1
                ? `Thanh toán (${selectedItems.size} sản phẩm, ${shopGroups.length} shop)`
                : `Thanh toán (${selectedItems.size} sản phẩm)`}
          </Button>
        )}

        {onCheckoutShop && shopGroups.length > 1 && (
          <div className="text-xs text-center text-neutral-6">
            Hoặc thanh toán từng shop riêng biệt ở danh sách bên trái
          </div>
        )}
      </div>

      {/* Info */}
      <p className="mt-4 text-xs text-center text-neutral-6">
        Miễn phí vận chuyển cho đơn hàng trên 500.000đ
      </p>
    </div>
  );
};

export default CartSummary;

