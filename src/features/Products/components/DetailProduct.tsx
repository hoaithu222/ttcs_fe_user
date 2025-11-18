import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Heart,
  Star,
  Package,
  Truck,
  Shield,
  ChevronLeft,
  ChevronRight,
  Share2,
  Store,
} from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { Product, ProductVariant } from "@/core/api/products/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import { useAppDispatch } from "@/app/store";
import { addToast } from "@/app/store/slices/toast";

interface DetailProductProps {
  product: Product;
  quantity: number;
  isWishlist: boolean;
  selectedVariant?: ProductVariant | null;
  onQuantityChange: (delta: number) => void;
  onVariantChange?: (variant: ProductVariant | null) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onToggleWishlist: () => void;
  isWishlistLoading?: boolean;
  isOwnShopProduct?: boolean;
}

const DetailProduct: React.FC<DetailProductProps> = ({
  product,
  quantity,
  isWishlist,
  selectedVariant,
  onQuantityChange,
  onVariantChange,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlistLoading = false,
  isOwnShopProduct = false,
}) => {
  const dispatch = useAppDispatch();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [localSelectedVariant, setLocalSelectedVariant] = useState<ProductVariant | null>(
    selectedVariant || null
  );
  const [variantError, setVariantError] = useState(false);
  const requiresVariantSelection = Boolean(product.variants && product.variants.length > 0);

  // Get image URLs
  const getImageUrls = (images: Product["images"] | undefined): string[] => {
    if (!images || images.length === 0) return [];
    return images.map((img) => {
      if (typeof img === "string") return img;
      return (img as any)?.url || "";
    });
  };

  const imageUrls = getImageUrls(product.images);

  // Use variant price if selected, otherwise use product price
  const currentPrice = localSelectedVariant?.price || product.price || 0;
  const currentStock = localSelectedVariant?.stock ?? product.stock ?? 0;
  const discountPercent = Math.min(
    Math.max(product.discount ?? 0, 0),
    100
  );
  const calculatedPrice = localSelectedVariant
    ? currentPrice - (currentPrice * discountPercent) / 100
    : product.finalPrice ??
      currentPrice - (currentPrice * discountPercent) / 100;
  const finalPrice = Math.max(0, calculatedPrice);
  const hasDiscount = discountPercent > 0;

  // Update selected variant when prop changes
  useEffect(() => {
    if (selectedVariant !== undefined) {
      setLocalSelectedVariant(selectedVariant);
      if (selectedVariant) {
        setVariantError(false);
      }
    }
  }, [selectedVariant]);

  // Handle variant selection
  const handleVariantSelect = (variant: ProductVariant) => {
    setLocalSelectedVariant(variant);
    setVariantError(false);
    if (onVariantChange) {
      onVariantChange(variant);
    }
  };

  const ensureVariantSelected = () => {
    if (requiresVariantSelection && !localSelectedVariant) {
      setVariantError(true);
      dispatch(
        addToast({
          type: "error",
          message: "Vui lòng chọn biến thể trước khi tiếp tục",
        })
      );
      return false;
    }
    return true;
  };

  const handleAddToCartClick = () => {
    if (!ensureVariantSelected()) return;
    onAddToCart();
  };

  const handleBuyNowClick = () => {
    if (!ensureVariantSelected()) return;
    onBuyNow();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative overflow-hidden bg-neutral-2 rounded-xl aspect-square">
          {imageUrls[selectedImageIndex] ? (
            <img
              src={imageUrls[selectedImageIndex]}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex justify-center items-center w-full h-full">
              <Package className="w-24 h-24 text-neutral-4" />
            </div>
          )}

          {/* Image Navigation */}
          {imageUrls.length > 1 && (
            <>
              <button
                onClick={() =>
                  setSelectedImageIndex(
                    selectedImageIndex > 0 ? selectedImageIndex - 1 : imageUrls.length - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-9" />
              </button>
              <button
                onClick={() =>
                  setSelectedImageIndex(
                    selectedImageIndex < imageUrls.length - 1 ? selectedImageIndex + 1 : 0
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-neutral-9" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Images - Grid layout for better display */}
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {imageUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative overflow-hidden rounded-lg border-2 transition-all aspect-square ${
                  selectedImageIndex === index
                    ? "border-primary-6 ring-2 ring-primary-6/20"
                    : "border-border-1 hover:border-primary-3"
                }`}
              >
                <img
                  src={url}
                  alt={`${product.name} ${index + 1}`}
                  className="object-cover w-full h-full"
                />
                {selectedImageIndex === index && (
                  <div className="absolute inset-0 bg-primary-6/10" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Shop Info Overlay - Behind images */}
        {product.shop && (
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/60 backdrop-blur-sm rounded-lg border border-white/20 z-10">
            <div className="flex gap-3 items-center">
              {product.shop.logo ? (
                <img
                  src={product.shop.logo}
                  alt={product.shop.name}
                  className="w-8 h-8 rounded-full object-cover border border-white/30"
                />
              ) : (
                <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary-6 border border-white/30">
                  <Store className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/90 font-medium truncate">{product.shop.name}</p>
                {product.shop.rating !== undefined && product.shop.rating > 0 && (
                  <div className="flex gap-1 items-center">
                    <Star className="w-3 h-3 fill-warning text-warning" />
                    <span className="text-xs text-white/70">{product.shop.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Product Name */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-9 mb-2">{product.name}</h1>
          {product.metaKeywords && (
            <p className="text-sm text-neutral-6">Tags: {product.metaKeywords}</p>
          )}
        </div>

        {/* Rating */}
        {product.rating !== undefined && product.rating > 0 && (
          <div className="flex gap-2 items-center">
            <div className="flex gap-1 items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating!) ? "fill-warning text-warning" : "text-neutral-3"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-neutral-6">
              {product.rating.toFixed(1)} ({product.reviewCount || 0} đánh giá)
            </span>
          </div>
        )}

        {/* Price */}
        <div className="p-4 bg-primary-10/30 rounded-lg border border-primary-6/20">
          <div className="flex gap-3 items-baseline">
            <span className="text-3xl font-bold text-primary-6">{formatPriceVND(finalPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-neutral-5 line-through">
                  {formatPriceVND(currentPrice)}
                </span>
                <span className="px-2 py-1 text-sm font-bold text-white bg-error rounded-md">
                  -{Math.round(discountPercent)}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Variants Selection */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-4">
            {Object.keys(product.variants[0].attributes || {}).map((attrName) => {
              // Get unique values for this attribute
              const uniqueValues = Array.from(
                new Set(
                  product
                    .variants!.map((v) => v.attributes[attrName])
                    .filter((val) => val !== undefined)
                )
              );

              return (
                <div key={attrName}>
                  <label className="block mb-2 text-sm font-medium text-neutral-9">
                    {attrName}:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueValues.map((value) => {
                      const variant = product.variants!.find(
                        (v) => v.attributes[attrName] === value
                      );
                      const isSelected = localSelectedVariant?.attributes[attrName] === value;
                      const isAvailable = variant && variant.stock > 0;

                      return (
                        <button
                          key={value}
                          onClick={() => variant && handleVariantSelect(variant)}
                          disabled={!isAvailable}
                          className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                            isSelected
                              ? "border-primary-6 bg-primary-6/10 text-primary-6"
                              : isAvailable
                                ? "border-border-1 hover:border-primary-3 text-neutral-7 hover:bg-neutral-1"
                                : "border-border-1 text-neutral-4 cursor-not-allowed opacity-50"
                          }`}
                        >
                          {value}
                          {variant && variant.stock > 0 && (
                            <span className="ml-1 text-xs">({variant.stock})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Display selected variant info */}
            {localSelectedVariant && (
              <div className="p-3 bg-primary-10/30 rounded-lg border border-primary-6/20">
                <div className="flex gap-2 items-center text-sm">
                  <span className="font-medium text-neutral-9">Đã chọn:</span>
                  <span className="text-neutral-7">
                    {Object.entries(localSelectedVariant.attributes)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(", ")}
                  </span>
                </div>
                {localSelectedVariant.sku && (
                  <div className="text-xs text-neutral-6 mt-1">SKU: {localSelectedVariant.sku}</div>
                )}
              </div>
            )}

            {variantError && (
              <p className="text-sm text-error">
                Bạn cần chọn đầy đủ biến thể trước khi tiếp tục thao tác.
              </p>
            )}
          </div>
        )}

        {/* Stock */}
        <div className="flex gap-2 items-center text-sm">
          <Package className="w-4 h-4 text-neutral-6" />
          <span className={currentStock > 0 ? "text-success" : "text-error"}>
            {currentStock > 0 ? `Còn ${currentStock} sản phẩm` : "Hết hàng"}
          </span>
        </div>

        {/* Quantity & Actions */}
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-neutral-9">Số lượng:</label>
            <div className="flex gap-2 items-center">
              <Button
                color="gray"
                variant="outline"
                size="sm"
                onClick={() => onQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center font-semibold text-neutral-9">{quantity}</span>
              <Button
                color="gray"
                variant="outline"
                size="sm"
                onClick={() => onQuantityChange(1)}
                disabled={quantity >= currentStock}
              >
                +
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                color="blue"
                variant="solid"
                size="lg"
                fullWidth
                onClick={handleAddToCartClick}
                disabled={currentStock === 0 || isOwnShopProduct}
                icon={<ShoppingCart className="w-5 h-5" />}
              >
                {isOwnShopProduct
                  ? "Sản phẩm thuộc cửa hàng của bạn"
                  : currentStock > 0
                    ? "Thêm vào giỏ hàng"
                    : "Hết hàng"}
              </Button>
              <Button
                color={isWishlist ? "red" : "gray"}
                variant="outline"
                size="lg"
                onClick={onToggleWishlist}
                disabled={isWishlistLoading}
                icon={<Heart className={`w-5 h-5 ${isWishlist ? "fill-current" : ""}`} />}
              />
              <Button
                color="gray"
                variant="outline"
                size="lg"
                icon={<Share2 className="w-5 h-5" />}
              />
            </div>
            <Button
              color="green"
              variant="solid"
              size="lg"
              fullWidth
              onClick={handleBuyNowClick}
              disabled={currentStock === 0 || isOwnShopProduct}
            >
              {isOwnShopProduct
                ? "Không thể mua sản phẩm của bạn"
                : currentStock > 0
                  ? "Mua ngay"
                  : "Hết hàng"}
            </Button>
          </div>
          {isOwnShopProduct && (
            <p className="text-sm text-warning bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
              Bạn không thể thêm vào giỏ hoặc mua sản phẩm thuộc cửa hàng của chính mình.
            </p>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-3 pt-4 border-t border-border-1">
          <div className="flex gap-3 items-center text-sm">
            <Truck className="w-5 h-5 text-primary-6" />
            <span className="text-neutral-7">Miễn phí vận chuyển cho đơn hàng trên 500k</span>
          </div>
          <div className="flex gap-3 items-center text-sm">
            <Shield className="w-5 h-5 text-primary-6" />
            <span className="text-neutral-7">Bảo hành: {product.warrantyInfo}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailProduct;
