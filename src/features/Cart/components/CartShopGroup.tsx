import React, { useState, useMemo } from "react";
import { Store, Trash2, ShoppingBag, Gift, Truck, ChevronRight } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import Checkbox from "@/foundation/components/input/Checkbox";
import CartItem from "./CartItem";
import { CartItem as CartItemType } from "@/core/api/cart/type";
import type { ProductVariant } from "@/core/api/products/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";

interface CartShopGroupProps {
  shopId: string;
  shopName: string;
  shopLogo?: string;
  items: CartItemType[];
  selectedItems?: Set<string>;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onRemoveShop?: (shopId: string) => void;
  onCheckoutShop?: (shopId: string) => void;
  onVariantChange?: (item: CartItemType, variant: ProductVariant) => void;
  onItemSelect?: (itemId: string, selected: boolean) => void;
  isLoading?: boolean;
}

const CartShopGroup: React.FC<CartShopGroupProps> = ({
  shopId,
  shopName,
  shopLogo,
  items,
  selectedItems = new Set(),
  onQuantityChange,
  onRemove,
  onRemoveShop,
  onCheckoutShop,
  onVariantChange,
  onItemSelect,
  isLoading = false,
}) => {
  const [showVouchers, setShowVouchers] = useState(false);

  // Calculate shop subtotal for selected items only
  const shopSubtotal = useMemo(() => {
    return items
      .filter((item) => selectedItems.has(item._id))
      .reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  }, [items, selectedItems]);
  
  const shopItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const selectedItemCount = items.filter((item) => selectedItems.has(item._id)).length;

  // Check if all items in this shop are selected
  const allItemsSelected = useMemo(() => {
    if (items.length === 0) return false;
    return items.every((item) => selectedItems.has(item._id));
  }, [items, selectedItems]);

  // Check if some items are selected (for indeterminate state)
  const someItemsSelected = useMemo(() => {
    if (items.length === 0) return false;
    const selectedCount = items.filter((item) => selectedItems.has(item._id)).length;
    return selectedCount > 0 && selectedCount < items.length;
  }, [items, selectedItems]);

  const handleShopSelect = (checked: boolean | "indeterminate") => {
    if (!onItemSelect) return;
    const isSelected = checked === true;
    items.forEach((item) => {
      onItemSelect(item._id, isSelected);
    });
  };

  return (
    <div className="mb-4 bg-background-2 rounded-2xl border border-border-1 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Shop Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-background-1/80 backdrop-blur-sm border-b border-border-1">
        {onItemSelect && (
          <Checkbox
            checked={allItemsSelected ? true : someItemsSelected ? "indeterminate" : false}
            onCheckedChange={handleShopSelect}
            size="base"
            className="flex-shrink-0"
          />
        )}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {shopLogo ? (
            <img
              src={shopLogo}
              alt={shopName}
              className="w-8 h-8 rounded object-cover border border-border-1 flex-shrink-0"
            />
          ) : (
            <div className="flex justify-center items-center w-8 h-8 rounded bg-primary-6/10 border border-border-1 flex-shrink-0">
              <Store className="w-4 h-4 text-primary-6" />
            </div>
          )}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-9 truncate">{shopName}</h3>
            {onItemSelect && selectedItemCount > 0 && (
              <span className="text-xs text-primary-6 font-medium">
                ({selectedItemCount}/{items.length} đã chọn)
              </span>
            )}
            {/* <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 flex-shrink-0">
              <ShoppingBag className="w-3 h-3 text-red-500" />
              <span className="text-[10px] font-semibold text-red-500">Mall</span>
            </div> */}
          </div>
        </div>
        {onRemoveShop && (
          <Button
            color="gray"
            variant="ghost"
            size="xs"
            onClick={() => onRemoveShop(shopId)}
            disabled={isLoading}
            className="text-neutral-6 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Shop Items */}
      <div className="divide-y divide-border-1">
        {items.map((item) => (
          <div key={item._id} className="bg-background-2">
            <CartItem
              item={item}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
              onVariantChange={onVariantChange}
              isLoading={isLoading}
              isSelected={selectedItems.has(item._id)}
              onSelectChange={onItemSelect}
            />
          </div>
        ))}
      </div>

      {/* Voucher & Shipping Section */}
      <div className="px-4 py-3 bg-background-1 border-t border-border-1 space-y-2">
        {/* Voucher Section */}
        {/* <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary-6" />
            <span className="text-sm text-neutral-7">Voucher giảm đến 35k₫</span>
          </div>
          <button
            onClick={() => setShowVouchers(!showVouchers)}
            className="text-sm text-primary-6 hover:text-primary-7 flex items-center gap-1"
          >
            Xem thêm voucher
            <ChevronRight className={`w-4 h-4 transition-transform ${showVouchers ? "rotate-90" : ""}`} />
          </button>
        </div> */}

        {/* Shipping Section */}
        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary-6" />
            <span className="text-neutral-7">
              Ưu đãi phí vận chuyển cho các đơn từ shop này (nếu đủ điều kiện)
            </span>
          </div>
          <button className="text-sm text-primary-6 hover:text-primary-7">Tìm hiểu thêm</button>
        </div>
      </div>

      {/* Shop Footer - Checkout Button */}
      {onCheckoutShop && (
        <div className="px-4 py-3 bg-background-1 border-t border-border-1 flex justify-between items-center">
          <div className="text-sm text-neutral-7">
            {selectedItemCount > 0 ? (
              <span>
                Tổng: <span className="font-semibold text-primary-6">{formatPriceVND(shopSubtotal)}</span>
              </span>
            ) : (
              <span>Chọn sản phẩm để thanh toán</span>
            )}
          </div>
          <Button
            variant="solid"
            size="sm"
            onClick={() => onCheckoutShop(shopId)}
            disabled={isLoading || selectedItemCount === 0}
            loading={isLoading}
            className="min-w-[120px]"
          >
            Mua hàng ({selectedItemCount})
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartShopGroup;
