import React, { useMemo } from "react";
import Modal from "@/foundation/components/modal/Modal";
import Button from "@/foundation/components/buttons/Button";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import type { Product, ProductVariant } from "@/core/api/products/type";
import { Check, Package, Tag } from "lucide-react";

interface CartVariantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Partial<Product>;
  currentVariantId?: string;
  onSelect: (variant: ProductVariant) => void;
}

const CartVariantModal: React.FC<CartVariantModalProps> = ({
  open,
  onOpenChange,
  product,
  currentVariantId,
  onSelect,
}) => {
  const variants = product?.variants || [];
  const productDiscount = product?.discount || 0;

  const sortedVariants = useMemo(() => {
    return [...variants];
  }, [variants]);

  if (!product || variants.length === 0) {
    return null;
  }

  const getFinalPrice = (variant: ProductVariant) => {
    const basePrice = variant.price ?? product.price ?? 0;
    const discountPercent = Math.min(Math.max(productDiscount, 0), 100);
    const discountedPrice =
      product?.finalPrice && !variant ? product.finalPrice : basePrice - (basePrice * discountPercent) / 100;
    return Math.max(0, discountedPrice);
  };

  const formatAttributes = (variant: ProductVariant) => {
    if (!variant.attributes) return "Không có thuộc tính";
    return Object.entries(variant.attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(" • ");
  };

  const handleSelectVariant = (variant: ProductVariant) => {
    onSelect(variant);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Chọn phân loại - ${product.name}`}
      size="lg"
    >
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {sortedVariants.map((variant) => {
          const variantId = (variant._id as string) || (variant as any)?.id || variant.sku;
          const isSelected = variantId && currentVariantId && variantId === currentVariantId;
          const isOutOfStock = (variant.stock ?? 0) <= 0;
          const finalPrice = getFinalPrice(variant);
          const attrs = formatAttributes(variant);
          const imageSrc =
            (typeof variant.image === "string" && variant.image) ||
            (variant.image && typeof variant.image === "object" && (variant.image as any).url);

          return (
            <button
              key={variantId || attrs}
              type="button"
              onClick={() => handleSelectVariant(variant)}
              disabled={isOutOfStock}
              className={`w-full text-left border-2 rounded-2xl p-3 transition-all ${
                isSelected ? "border-primary-6 bg-primary-1/50" : "border-border-1 hover:border-primary-3"
              } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex gap-3 items-start">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={attrs}
                    className="w-14 h-14 rounded-lg object-cover border border-border-1 flex-shrink-0"
                  />
                ) : (
                  <div className="flex justify-center items-center w-14 h-14 rounded-lg bg-neutral-2 border border-border-1 flex-shrink-0">
                    <Package className="w-5 h-5 text-neutral-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-semibold text-neutral-9 line-clamp-2">{attrs}</p>
                      {variant.sku && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-neutral-6 mt-1">
                          <Tag className="w-3 h-3" />
                          {variant.sku}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-primary-6 flex items-center gap-1 text-xs font-semibold">
                        <Check className="w-4 h-4" />
                        Đang chọn
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-base font-bold text-primary-6">
                      {formatPriceVND(finalPrice)}
                    </span>
                    {variant.stock !== undefined && (
                      <span className="text-xs text-neutral-5">
                        Tồn kho:{" "}
                        <span className="font-semibold text-neutral-7">
                          {variant.stock > 0 ? variant.stock : "Hết hàng"}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end">
        <Button color="gray" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
          Đóng
        </Button>
      </div>
    </Modal>
  );
};

export default CartVariantModal;

