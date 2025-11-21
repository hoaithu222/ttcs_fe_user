import React, { useMemo, useState } from "react";
import { Product } from "@/core/api/products/type";
import Image from "@/foundation/components/icons/Image";
import { Heart, Star, Package, Store } from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "@/features/Profile/hooks/useWishlist";

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
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check if product is in wishlist from Redux state or product prop
  const isWishlist = useMemo(() => {
    if (product._id) {
      return isInWishlist(product._id) || product.isInWishlist || false;
    }
    return product.isInWishlist || false;
  }, [product._id, product.isInWishlist, isInWishlist]);

  const handleProductClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlistLoading) return;

    setWishlistLoading(true);
    try {
      // Use callback if provided (for custom handling), otherwise use hook
      if (onWishlistClick) {
        onWishlistClick(product._id);
      } else {
        await toggleWishlist(product._id);
      }
    } catch (error) {
      // Error handling is done in useWishlist hook
    } finally {
      setWishlistLoading(false);
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
    <div
      className={clsx(
        "group relative flex flex-col h-full overflow-hidden rounded-lg bg-background-dialog border border-border-1",
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        "cursor-pointer",
        className
      )}
      onClick={handleProductClick}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-neutral-2">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            className="w-full h-full transition-transform duration-500 group-hover:scale-110"
            objectFit="cover"
            fallbackType="default"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-2">
            <Package className="h-12 w-12 text-neutral-4" />
          </div>
        )}

        {/* Discount Badge - Style Shopee */}
        {hasDiscount && (
          <div className="absolute top-0 left-0 bg-error text-white px-2 py-1 rounded-br-lg text-xs font-bold shadow-sm">
            -{Math.round(discountPercent)}%
          </div>
        )}

        {/* Wishlist Button */}
        {showWishlist && (
          <button
            onClick={handleWishlistClick}
            disabled={wishlistLoading}
            className={clsx(
              "absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200 z-10",
              "bg-white/95 hover:bg-white shadow-sm backdrop-blur-sm",
              "flex items-center justify-center",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isWishlist ? "text-error" : "text-neutral-6 hover:text-error"
            )}
            aria-label={isWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={clsx(
                "w-4 h-4",
                isWishlist && "fill-current"
              )}
            />
          </button>
        )}

        {/* Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <span className="px-3 py-1.5 text-sm font-semibold text-white bg-error/90 rounded-md">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Content - Style Shopee */}
      <div className="flex flex-1 flex-col p-3 gap-2">
        {/* Product Name */}
        <h3 className="text-sm font-medium text-neutral-9 line-clamp-2 min-h-[2.5rem] leading-snug group-hover:text-primary-6 transition-colors">
          {product.name}
        </h3>

        {/* Shop Info */}
        {product.shop && (
          <div className="flex items-center gap-1.5">
            {product.shop.logo ? (
              <img
                src={product.shop.logo}
                alt={product.shop.name}
                className="h-4 w-4 rounded-full object-cover border border-border-1"
              />
            ) : (
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-2">
                <Store className="h-2.5 w-2.5 text-neutral-5" />
              </div>
            )}
            <span className="text-xs text-neutral-6 truncate">{product.shop.name || "Cửa hàng"}</span>
          </div>
        )}

        {/* Rating & Sales */}
        {product.rating !== undefined && product.rating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span className="text-xs font-medium text-neutral-8">{product.rating.toFixed(1)}</span>
            </div>
            {product.reviewCount !== undefined && product.reviewCount > 0 && (
              <span className="text-xs text-neutral-5">({product.reviewCount})</span>
            )}
            {product.salesCount !== undefined && product.salesCount > 0 && (
              <>
                <span className="text-xs text-neutral-4">•</span>
                <span className="text-xs text-neutral-5">Đã bán {product.salesCount}</span>
              </>
            )}
          </div>
        )}

        {/* Price - Style Shopee */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-lg font-bold text-error">{formattedPrice}</span>
          {hasDiscount && (
            <span className="text-xs text-neutral-5 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Discount Info */}
        {hasDiscount && savedAmount > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-neutral-6">Tiết kiệm</span>
            <span className="text-xs font-semibold text-error">{formatPrice(savedAmount)}</span>
          </div>
        )}

        {/* Stock Status */}
        {inStock && product.stock !== undefined && product.stock <= 10 && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-medium text-warning">Còn {product.stock} sản phẩm</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardProduct;

