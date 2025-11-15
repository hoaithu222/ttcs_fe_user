import React, { useMemo } from "react";
import CartShopGroup from "./CartShopGroup";
import Empty from "@/foundation/components/empty/Empty";
import Button from "@/foundation/components/buttons/Button";
import { CartItem as CartItemType } from "@/core/api/cart/type";

interface CartListProps {
  items: CartItemType[];
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onRemoveShop?: (shopId: string) => void;
  onCheckoutShop?: (shopId: string) => void;
  isLoading?: boolean;
  onContinueShopping?: () => void;
}

interface ShopGroup {
  shopId: string;
  shopName: string;
  shopLogo?: string;
  items: CartItemType[];
}

const CartList: React.FC<CartListProps> = ({
  items,
  onQuantityChange,
  onRemove,
  onRemoveShop,
  onCheckoutShop,
  isLoading = false,
  onContinueShopping,
}) => {
  // Group items by shop
  const shopGroups = useMemo(() => {
    if (!items || items.length === 0) return [];

    const groups = new Map<string, ShopGroup>();

    items.forEach((item) => {
      const shopId =
        typeof item.shopId === "string"
          ? item.shopId
          : typeof item.shopId === "object" && item.shopId
            ? item.shopId._id
            : "";
      const shopName = item.shopName || "Cửa hàng";

      if (!shopId) return; // Skip if no shopId

      if (!groups.has(shopId)) {
        groups.set(shopId, {
          shopId,
          shopName,
          shopLogo:
            typeof item.shopId === "object" && item.shopId && "logo" in item.shopId
              ? item.shopId.logo
              : undefined,
          items: [],
        });
      }

      groups.get(shopId)!.items.push(item);
    });

    return Array.from(groups.values());
  }, [items]);

  if (!items || items.length === 0) {
    return (
      <div className="py-12">
        <Empty
          variant="data"
          title="Giỏ hàng trống"
          description="Bạn chưa có sản phẩm nào trong giỏ hàng"
          action={
            onContinueShopping && (
              <Button color="blue" variant="solid" onClick={onContinueShopping}>
                Tiếp tục mua sắm
              </Button>
            )
          }
        />
      </div>
    );
  }

  const handleRemoveShop = (shopId: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tất cả sản phẩm của shop này khỏi giỏ hàng?`)) {
      if (onRemoveShop) {
        onRemoveShop(shopId);
      } else {
        // Fallback: remove all items from this shop
        const shopItems = items.filter((item) => {
          const itemShopId =
            typeof item.shopId === "string"
              ? item.shopId
              : typeof item.shopId === "object" && item.shopId
                ? item.shopId._id
                : "";
          return itemShopId === shopId;
        });
        shopItems.forEach((item) => onRemove(item._id));
      }
    }
  };

  return (
    <div className="space-y-6">
      {shopGroups.map((group) => (
        <CartShopGroup
          key={group.shopId}
          shopId={group.shopId}
          shopName={group.shopName}
          shopLogo={group.shopLogo}
          items={group.items}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
          onRemoveShop={handleRemoveShop}
          onCheckoutShop={onCheckoutShop}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default CartList;
