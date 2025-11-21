import React, { useMemo, useState } from "react";
import CartShopGroup from "./CartShopGroup";
import Empty from "@/foundation/components/empty/Empty";
import Button from "@/foundation/components/buttons/Button";
import { CartItem as CartItemType } from "@/core/api/cart/type";
import type { ProductVariant } from "@/core/api/products/type";
import ConfirmModal from "@/foundation/components/modal/ModalConfirm";

interface CartListProps {
  items: CartItemType[];
  selectedItems?: Set<string>;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onRemoveShop?: (shopId: string) => void;
  onCheckoutShop?: (shopId: string) => void;
  onVariantChange?: (item: CartItemType, variant: ProductVariant) => void;
  onItemSelect?: (itemId: string, selected: boolean) => void;
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
  selectedItems = new Set(),
  onQuantityChange,
  onRemove,
  onRemoveShop,
  onCheckoutShop,
  onVariantChange,
  onItemSelect,
  isLoading = false,
  onContinueShopping,
}) => {
  const [shopToRemove, setShopToRemove] = useState<string | null>(null);

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
    setShopToRemove(shopId);
  };

  const handleConfirmRemoveShop = () => {
    if (!shopToRemove) return;

    if (onRemoveShop) {
      onRemoveShop(shopToRemove);
    } else {
      const shopItems = items.filter((item) => {
        const itemShopId =
          typeof item.shopId === "string"
            ? item.shopId
            : typeof item.shopId === "object" && item.shopId
              ? item.shopId._id
              : "";
        return itemShopId === shopToRemove;
      });
      shopItems.forEach((item) => onRemove(item._id));
    }

    setShopToRemove(null);
  };

  return (
    <>
      <div className="space-y-4">
        {shopGroups.map((group) => (
          <CartShopGroup
            key={group.shopId}
            shopId={group.shopId}
            shopName={group.shopName}
            shopLogo={group.shopLogo}
            items={group.items}
            selectedItems={selectedItems}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
            onRemoveShop={handleRemoveShop}
            onCheckoutShop={onCheckoutShop}
            onVariantChange={onVariantChange}
            onItemSelect={onItemSelect}
            isLoading={isLoading}
          />
        ))}
      </div>
      <ConfirmModal
        open={!!shopToRemove}
        onOpenChange={(open) => !open && setShopToRemove(null)}
        title="Xóa sản phẩm của cửa hàng"
        content="Bạn có chắc chắn muốn xóa tất cả sản phẩm của cửa hàng này khỏi giỏ hàng?"
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        iconType="warning"
        onConfirm={handleConfirmRemoveShop}
        onCancel={() => setShopToRemove(null)}
        disabled={isLoading}
      />
    </>
  );
};

export default CartList;
