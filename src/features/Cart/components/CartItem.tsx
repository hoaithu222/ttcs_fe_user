import React, { useMemo, useState } from "react";
import { Trash2, Plus, Minus, Package, Tag } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { CartItem as CartItemType } from "@/core/api/cart/type";
import type { ProductVariant } from "@/core/api/products/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import { getCartItemVariantInfo } from "../utils/cartVariant.helpers";
import CartVariantModal from "./CartVariantModal";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onVariantChange?: (item: CartItemType, variant: ProductVariant) => void;
  isLoading?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
  onVariantChange,
  isLoading = false,
}) => {
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  const handleIncrease = () => {
    onQuantityChange(item._id, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item._id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      onRemove(item._id);
    }
  };

  const variantInfo = getCartItemVariantInfo(item);
  const productImage = variantInfo.image || item.productImage || "";
  const productName = item.productName || "Sản phẩm";
  const finalPrice = item.finalPrice || item.productPrice || item.priceAtTime || 0;
  const totalPrice = item.totalPrice || finalPrice * item.quantity;
  const hasVariantAttributes = variantInfo.attributes && Object.keys(variantInfo.attributes).length > 0;
  const canChangeVariant =
    !!onVariantChange && !!item.product?.variants && item.product.variants.length > 1;
  const currentVariantId = useMemo(() => {
    if (!item.variantId) return undefined;
    if (typeof item.variantId === "string") return item.variantId;
    if (typeof (item.variantId as any)?._id === "string") return (item.variantId as any)._id;
    return (item.variantId as any)?.toString?.();
  }, [item.variantId]);

  const handleVariantSelect = (variant: ProductVariant) => {
    if (!onVariantChange) return;
    onVariantChange(item, variant);
    setIsVariantModalOpen(false);
  };

  return (
    <div className="flex gap-4 p-4 bg-background-1 rounded-2xl border border-border-1 hover:border-primary-3 hover:shadow-lg transition-all duration-200">
      {/* Product Image */}
      <div className="flex-shrink-0">
        {productImage ? (
          <img
            src={productImage}
            alt={productName}
            className="w-24 h-24 rounded-lg object-cover border border-border-1"
          />
        ) : (
          <div className="flex justify-center items-center w-24 h-24 rounded-lg bg-neutral-2 border border-border-1">
            <Package className="w-8 h-8 text-neutral-4" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-neutral-9 mb-1 line-clamp-2">
              {productName}
            </h3>
            {item.shopName && (
              <p className="text-sm text-neutral-6 mb-2">Cửa hàng: {item.shopName}</p>
            )}
            {(variantInfo.sku || hasVariantAttributes) && (
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {variantInfo.sku && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-1 text-primary-7 text-[11px] font-semibold border border-primary-3">
                    <Tag className="w-3 h-3" />
                    SKU: {variantInfo.sku}
                  </span>
                )}
                {hasVariantAttributes &&
                  Object.entries(variantInfo.attributes!).map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-2 text-neutral-7 text-[11px] border border-border-1"
                    >
                      <span className="font-medium text-neutral-8">{key}:</span> {value}
                    </span>
                  ))}
              </div>
            )}
            {canChangeVariant && (
              <Button
                color="gray"
                variant="ghost"
                size="xs"
                onClick={() => setIsVariantModalOpen(true)}
                className="px-2 py-1 text-[11px]"
              >
                Đổi phân loại
              </Button>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-neutral-5">Đơn giá</p>
                <span className="text-lg font-bold text-primary-6">
                  {formatPriceVND(finalPrice)}
                </span>
              </div>
              {item.productPrice && item.productPrice > finalPrice && (
                <div className="text-sm text-neutral-5 line-through">{formatPriceVND(item.productPrice)}</div>
              )}
              {item.priceAtTime && item.priceAtTime !== finalPrice && (
                <div className="text-xs text-neutral-5">
                  Giá lúc thêm: <span className="font-medium">{formatPriceVND(item.priceAtTime)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Remove Button */}
          <Button
            color="gray"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isLoading}
            icon={<Trash2 className="w-4 h-4" />}
            className="flex-shrink-0"
          />
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 border-t border-border-1 pt-4">
          <div className="flex items-center gap-2 bg-neutral-1 px-3 py-2 rounded-full border border-border-1">
            <Button
              color="gray"
              variant="outline"
              size="sm"
              onClick={handleDecrease}
              disabled={isLoading || item.quantity <= 1}
              icon={<Minus className="w-4 h-4" />}
            />
            <span className="w-12 text-center font-semibold text-neutral-9">{item.quantity}</span>
            <Button
              color="gray"
              variant="outline"
              size="sm"
              onClick={handleIncrease}
              disabled={isLoading}
              icon={<Plus className="w-4 h-4" />}
            />
          </div>

          {/* Total Price */}
          <div className="text-right ml-auto">
            <p className="text-sm text-neutral-6 mb-1">Thành tiền</p>
            <p className="text-xl font-bold text-primary-6">{formatPriceVND(totalPrice)}</p>
            {item.quantity > 1 && (
              <p className="text-xs text-neutral-5">
                {formatPriceVND(finalPrice)} x {item.quantity}
              </p>
            )}
          </div>
        </div>
      </div>
      {canChangeVariant && (
        <CartVariantModal
          open={isVariantModalOpen}
          onOpenChange={setIsVariantModalOpen}
          product={item.product}
          currentVariantId={currentVariantId}
          onSelect={handleVariantSelect}
        />
      )}
    </div>
  );
};

export default CartItem;

