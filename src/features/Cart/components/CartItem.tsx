import React, { useMemo, useState } from "react";
import { Plus, Minus, Package, Tag, ChevronDown } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import Checkbox from "@/foundation/components/input/Checkbox";
import ConfirmModal from "@/foundation/components/modal/ModalConfirm";
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
  isSelected?: boolean;
  onSelectChange?: (itemId: string, selected: boolean) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
  onVariantChange,
  isLoading = false,
  isSelected = false,
  onSelectChange,
}) => {
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const handleIncrease = () => {
    onQuantityChange(item._id, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item._id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    setIsRemoveModalOpen(true);
  };

  const handleConfirmRemove = () => {
    onRemove(item._id);
    setIsRemoveModalOpen(false);
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

  const handleSelectChange = (checked: boolean | "indeterminate") => {
    if (onSelectChange) {
      onSelectChange(item._id, checked === true);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row mb-2 items-start gap-3 p-3 sm:p-4 transition-colors rounded-xl  ${
        isSelected
          ? "bg-primary-1/40  hover:bg-primary-1/70"
          : "bg-transparent border-transparent hover:bg-background-3"
      }`}
    >
      {/* Checkbox */}
      {onSelectChange && (
        <div className="pt-1 flex-shrink-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelectChange}
            size="base"
          />
        </div>
      )}

      {/* Product Image */}
      <div className="flex-shrink-0">
        {productImage ? (
          <img
            src={productImage}
            alt={productName}
            className="w-16 h-16 rounded object-cover border border-border-1"
          />
        ) : (
          <div className="flex justify-center items-center w-16 h-16 rounded bg-neutral-2 border border-border-1">
            <Package className="w-5 h-5 text-neutral-4" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm text-start font-medium text-neutral-9 mb-1 line-clamp-2 leading-snug">
              {productName}
            </h3>
            
            {/* Variant Selection */}
            {canChangeVariant && (
              <button
                onClick={() => setIsVariantModalOpen(true)}
                className="flex items-center gap-1 text-xs text-primary-6 hover:text-primary-7 mb-1.5"
              >
                <span>Phân Loại Hàng:</span>
                <span className="font-medium">
                  {hasVariantAttributes
                    ? Object.entries(variantInfo.attributes!)
                        .map(([key, value]) => `${key} ${value}`)
                        .join(", ")
                    : variantInfo.sku || "Chọn phân loại"}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>
            )}

            {/* Variant Attributes Display */}
            {!canChangeVariant && (variantInfo.sku || hasVariantAttributes) && (
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                {variantInfo.sku && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-2 text-neutral-7 text-[10px] border border-border-1">
                    <Tag className="w-2.5 h-2.5" />
                    {variantInfo.sku}
                  </span>
                )}
                {hasVariantAttributes &&
                  Object.entries(variantInfo.attributes!).map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-2 text-neutral-7 text-[10px] border border-border-1"
                    >
                      <span className="font-medium text-neutral-8">{key}:</span> {value}
                    </span>
                  ))}
              </div>
            )}

            {/* Price, Quantity & Actions Row */}
            <div className="flex items-center justify-between gap-3 mt-2">
              {/* Price */}
              <div className="flex items-baseline gap-2">
                {item.productPrice && item.productPrice > finalPrice && (
                  <span className="text-xs text-neutral-5 line-through">
                    {formatPriceVND(item.productPrice)}
                  </span>
                )}
                <span className="text-sm font-semibold text-primary-6">
                  {formatPriceVND(finalPrice)}
                </span>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1 border border-border-1 rounded">
                <Button
                  color="gray"
                  variant="ghost"
                  size="xs"
                  onClick={handleDecrease}
                  disabled={isLoading || item.quantity <= 1}
                  className="rounded-r-none border-r border-border-1 h-7"
                  icon={<Minus className="w-3 h-3" />}
                />
                <span className="w-8 text-center text-xs font-medium text-neutral-9">
                  {item.quantity}
                </span>
                <Button
                  color="gray"
                  variant="ghost"
                  size="xs"
                  onClick={handleIncrease}
                  disabled={isLoading}
                  className="rounded-l-none border-l border-border-1 h-7"
                  icon={<Plus className="w-3 h-3" />}
                />
              </div>

              {/* Total Price */}
              <div className="text-right min-w-[80px]">
                <span className="text-sm font-semibold text-primary-6">
                  {formatPriceVND(totalPrice)}
                </span>
              </div>

              {/* Remove Button */}
              <button
                onClick={handleRemove}
                disabled={isLoading}
                className="text-xs text-red-500 hover:text-red-600 disabled:opacity-50 flex-shrink-0"
              >
                Xóa
              </button>
            </div>
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
      <ConfirmModal
        open={isRemoveModalOpen}
        onOpenChange={setIsRemoveModalOpen}
        title="Xóa sản phẩm khỏi giỏ hàng"
        content="Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        iconType="warning"
        onConfirm={handleConfirmRemove}
        onCancel={() => setIsRemoveModalOpen(false)}
        disabled={isLoading}
      />
    </div>
  );
};

export default CartItem;

