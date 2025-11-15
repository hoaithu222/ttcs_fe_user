import React from "react";
import { Store, Trash2 } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import CartItem from "./CartItem";
import { CartItem as CartItemType } from "@/core/api/cart/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";

interface CartShopGroupProps {
  shopId: string;
  shopName: string;
  shopLogo?: string;
  items: CartItemType[];
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onRemoveShop?: (shopId: string) => void;
  onCheckoutShop?: (shopId: string) => void;
  isLoading?: boolean;
}

const CartShopGroup: React.FC<CartShopGroupProps> = ({
  shopId,
  shopName,
  shopLogo,
  items,
  onQuantityChange,
  onRemove,
  onRemoveShop,
  onCheckoutShop,
  isLoading = false,
}) => {
  // Calculate shop subtotal
  const shopSubtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const shopItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="mb-8 last:mb-0">
      {/* Shop Header */}
      <div className="flex justify-between items-center mb-4 p-4 bg-background-2 rounded-xl border border-border-1">
        <div className="flex gap-3 items-center flex-1 min-w-0">
          {shopLogo ? (
            <img
              src={shopLogo}
              alt={shopName}
              className="w-10 h-10 rounded-lg object-cover border border-border-1 flex-shrink-0"
            />
          ) : (
            <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-primary-6/10 border border-border-1 flex-shrink-0">
              <Store className="w-5 h-5 text-primary-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-neutral-9 truncate">{shopName}</h3>
            <p className="text-sm text-neutral-6">
              {shopItemCount} sản phẩm • {formatPriceVND(shopSubtotal)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center flex-shrink-0">
          {onCheckoutShop && (
            <Button
              color="blue"
              variant="solid"
              size="sm"
              onClick={() => onCheckoutShop(shopId)}
              disabled={isLoading || shopItemCount === 0}
              loading={isLoading}
            >
              Thanh toán
            </Button>
          )}
          {onRemoveShop && (
            <Button
              color="gray"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveShop(shopId)}
              disabled={isLoading}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Xóa shop
            </Button>
          )}
        </div>
      </div>

      {/* Shop Items */}
      <div className="space-y-3 ml-4 pl-4 border-l-2 border-border-1">
        {items.map((item) => (
          <CartItem
            key={item._id}
            item={item}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
};

export default CartShopGroup;
