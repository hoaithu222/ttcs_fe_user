import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, Package } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { Card } from "@/foundation/components/info/Card";
import { Product } from "@/core/api/products/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import { useAddToCart } from "@/features/Cart/hooks/useAddToCart";

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
  const [imageError, setImageError] = useState(false);
  const [isWishlist, setIsWishlist] = useState(product.isInWishlist || false);

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

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlist(!isWishlist);
    if (onToggleWishlist) {
      onToggleWishlist(product._id);
    }
  };

  return (
    <Card
      className={`group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-neutral-2 aspect-square">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex justify-center items-center w-full h-full">
            <Package className="w-16 h-16 text-neutral-4" />
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white bg-error rounded-md">
            -{Math.round(discountPercent)}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
            isWishlist
              ? "bg-error text-white"
              : "bg-white/80 text-neutral-7 hover:bg-white hover:text-error"
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlist ? "fill-current" : ""}`} />
        </button>

        {/* Stock Badge */}
        {product.stock !== undefined && product.stock <= 10 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-1 text-xs font-medium text-white bg-warning rounded-md">
            Còn {product.stock} sản phẩm
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 flex justify-center items-center bg-black/50">
            <span className="px-4 py-2 text-sm font-semibold text-white bg-error rounded-lg">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Shop Info */}
        {product.shop && (
          <div className="flex gap-2 items-center">
            {product.shop.logo && (
              <img
                src={product.shop.logo}
                alt={product.shop.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            <span className="text-xs text-neutral-6 truncate">{product.shop.name}</span>
          </div>
        )}

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-neutral-9 line-clamp-2 min-h-[2.5rem] group-hover:text-primary-6 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating !== undefined && product.rating > 0 && (
          <div className="flex gap-1 items-center">
            <div className="flex gap-0.5 items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating!)
                      ? "fill-warning text-warning"
                      : "text-neutral-3"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-neutral-6">
              {product.rating.toFixed(1)} ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex gap-2 items-baseline">
          <span className="text-lg font-bold text-primary-6">
            {formatPriceVND(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-neutral-5 line-through">
              {formatPriceVND(product.price)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            color="blue"
            variant="solid"
            size="sm"
            fullWidth
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            icon={<ShoppingCart className="w-4 h-4" />}
          >
            {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;

