import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, Package, Store } from "lucide-react";
import Image from "@/foundation/components/icons/Image";
import clsx from "clsx";
import { Product } from "@/core/api/products/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import { useAddToCart } from "@/features/Cart/hooks/useAddToCart";
import { useWishlist } from "@/features/Profile/hooks/useWishlist";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  className = "",
}) => {
  const navigate = useNavigate();
  const { addToCart } = useAddToCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imageError, setImageError] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check if product is in wishlist from Redux state or product prop
  const isWishlist = useMemo(() => {
    if (product._id) {
      return isInWishlist(product._id) || product.isInWishlist || false;
    }
    return product.isInWishlist || false;
  }, [product._id, product.isInWishlist, isInWishlist]);

  // Get image URL
  const getImageUrl = (images: Product["images"] | undefined): string => {
    if (!images || images.length === 0) return "";
    const firstImage = images[0];
    if (typeof firstImage === "string") return firstImage;
    return (firstImage as any)?.url || "";
  };

  const imageUrl = getImageUrl(product.images);
  const basePrice = product.price || 0;
  const discountPercent = Math.min(Math.max(product.discount ?? 0, 0), 100);
  const finalPrice =
    product.finalPrice ??
    basePrice - (basePrice * discountPercent) / 100;
  const hasDiscount = discountPercent > 0;

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Use custom hook if no callback provided
    if (!onAddToCart) {
      addToCart(product, 1, undefined, { showToast: true });
    } else {
      onAddToCart(product._id);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlistLoading) return;
    
    setWishlistLoading(true);
    try {
      // Use callback if provided (for custom handling), otherwise use hook
      if (onToggleWishlist) {
        onToggleWishlist(product._id);
      } else {
        await toggleWishlist(product._id);
      }
    } catch (error) {
      // Error handling is done in useWishlist hook
    } finally {
      setWishlistLoading(false);
    }
  };

  const inStock = product.stock === undefined || product.stock > 0;

  return (
    <div
      className={clsx(
        "group relative flex flex-col h-full overflow-hidden rounded-lg bg-background-1 border border-border-1",
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        "cursor-pointer",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-neutral-2">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={product.name}
            className="w-full h-full transition-transform duration-500 group-hover:scale-110"
            objectFit="cover"
            fallbackType="default"
          />
        ) : (
          <div className="flex justify-center items-center w-full h-full bg-neutral-2">
            <Package className="w-12 h-12 text-neutral-4" />
          </div>
        )}

        {/* Discount Badge - Style Shopee */}
        {hasDiscount && (
          <div className="absolute top-0 left-0 bg-error text-white px-2 py-1 rounded-br-lg text-xs font-bold shadow-sm">
            -{Math.round(discountPercent)}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
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
          <Heart className={clsx("w-4 h-4", isWishlist && "fill-current")} />
        </button>

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
          <span className="text-lg font-bold text-error">{formatPriceVND(finalPrice)}</span>
          {hasDiscount && (
            <span className="text-xs text-neutral-5 line-through">
              {formatPriceVND(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {inStock && product.stock !== undefined && product.stock <= 10 && product.stock > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-medium text-warning">Còn {product.stock} sản phẩm</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

