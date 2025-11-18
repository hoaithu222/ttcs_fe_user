import React from "react";
import { Product } from "@/core/api/products/type";
import { Card } from "@/foundation/components/info/Card";
import Image from "@/foundation/components/icons/Image";
import { Heart, Star, Package, Store } from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

export interface CardProductProps {
  product: Product;
  className?: string;
  showWishlist?: boolean;
  onWishlistClick?: (productId: string) => void;
}

const CardProduct: React.FC<CardProductProps> = ({
  product,
  className,
  showWishlist = true,
  onWishlistClick,
}) => {
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWishlistClick) {
      onWishlistClick(product._id);
    }
  };

  const discountPercent = Math.min(
    Math.max(product.discount ?? 0, 0),
    100
  );

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Get main image url
  const getPrimaryImage = (images: Product["images"]) => {
    if (!images || images.length === 0) return "";
    const firstImage = images[0];
    if (typeof firstImage === "string") return firstImage;
    return firstImage?.url || "";
  };

  const mainImage = getPrimaryImage(product.images);
  const hasDiscount = discountPercent > 0;
  const inStock = product.stock === undefined || product.stock > 0;
  const discountedPrice =
    product.finalPrice ??
    product.price - (product.price * discountPercent) / 100;
  const formattedPrice = formatPrice(Math.max(0, discountedPrice));
  const savedAmount = hasDiscount
    ? product.price - Math.max(0, discountedPrice)
    : 0;

  return (
    <Card
      className={clsx(
        "group relative flex flex-col h-full overflow-hidden rounded-2xl border border-border-1 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        className
      )}
      hoverable
      onClick={handleProductClick}
      variant="elevated"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-neutral-2">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
            objectFit="cover"
            fallbackType="default"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-1">
            <Package className="h-12 w-12 text-primary-6" />
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-error text-white px-2 py-1 rounded-md text-xs font-semibold">
            -{Math.round(discountPercent)}%
          </div>
        )}

        {/* Wishlist Button */}
        {showWishlist && (
          <button
            onClick={handleWishlistClick}
            className={clsx(
              "absolute top-2 right-2 p-2 rounded-full transition-all duration-200",
              "bg-white/90 hover:bg-white shadow-md",
              "flex items-center justify-center",
              product.isInWishlist ? "text-error" : "text-neutral-7 hover:text-error"
            )}
            aria-label={product.isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={clsx(
                "w-5 h-5",
                product.isInWishlist && "fill-current"
              )}
            />
          </button>
        )}
        {/* Bottom gradient info */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/80 via-black/20 to-transparent px-4 pb-4 pt-10 text-white">
          <div className="flex items-center gap-2 text-xs text-white/80">
            {product.shop?.logo ? (
              <img
                src={product.shop.logo}
                alt={product.shop.name}
                className="h-6 w-6 rounded-full object-cover border border-white/30"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <Store className="h-3.5 w-3.5" />
              </div>
            )}
            <span className="truncate">{product.shop?.name || "Cửa hàng chính hãng"}</span>
          </div>
          <h3 className="text-base font-semibold leading-tight line-clamp-2">{product.name}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Price */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary-7">{formattedPrice}</span>
            {hasDiscount && (
              <span className="text-sm text-neutral-5 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          {hasDiscount && (
            <p className="text-xs text-neutral-6">Tiết kiệm {formatPrice(savedAmount)}</p>
          )}
        </div>

        {/* Rating */}
        {product.rating !== undefined && (
          <div className="flex items-center justify-between rounded-xl bg-neutral-1 px-3 py-2 text-xs text-neutral-6">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-semibold text-neutral-9">{product.rating.toFixed(1)}</span>
              <span>({product.reviewCount || 0})</span>
            </div>
            {product.salesCount !== undefined && product.salesCount > 0 && (
              <span className="font-medium text-neutral-7">Đã bán {product.salesCount}</span>
            )}
          </div>
        )}

        {/* Product summary */}
        <div className="rounded-xl border border-border-1 bg-neutral-1/30 p-3 text-xs text-neutral-6">
          <p className="line-clamp-2">
            {product.description || "Khám phá ngay sản phẩm đang được yêu thích nhất tuần này."}
          </p>
        </div>

        {/* Stock Status */}
        <div className="mt-auto flex items-center justify-between text-xs font-medium">
          <span className={clsx(inStock ? "text-success" : "text-error", "rounded-lg px-3 py-1")}>
            {inStock ? `Còn ${product.stock ?? "nhiều"} sản phẩm` : "Hết hàng"}
          </span>
          {product.metaKeywords && (
            <span className="truncate text-neutral-5">#{product.metaKeywords.split(",")[0]}</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CardProduct;

