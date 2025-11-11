import React from "react";
import { Product } from "@/core/api/products/type";
import { Card } from "@/foundation/components/info/Card";
import Image from "@/foundation/components/icons/Image";
import Button from "@/foundation/components/buttons/Button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

export interface CardProductProps {
  product: Product;
  className?: string;
  showWishlist?: boolean;
  showAddToCart?: boolean;
  onWishlistClick?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}

const CardProduct: React.FC<CardProductProps> = ({
  product,
  className,
  showWishlist = true,
  showAddToCart = true,
  onWishlistClick,
  onAddToCart,
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

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product._id);
    }
  };

  // Calculate discount percentage
  const discountPercent = product.discount
    ? Math.round((product.discount / product.price) * 100)
    : 0;

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Get main image
  const mainImage = product.images && product.images.length > 0 ? product.images[0] : "";

  return (
    <Card
      className={clsx("group relative flex flex-col h-full", className)}
      hoverable
      shadow
      onClick={handleProductClick}
      variant="elevated"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden rounded-t-lg bg-neutral-2">
        <Image
          src={mainImage}
          alt={product.name}
          className="w-full h-full transition-transform duration-300 group-hover:scale-110"
          objectFit="cover"
          fallbackType="default"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-error text-white px-2 py-1 rounded-md text-xs font-semibold">
            -{discountPercent}%
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

        {/* Flash Sale Badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute bottom-2 left-2 bg-gradient-to-r from-error to-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Flash Sale
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Shop Name */}
        {product.shop && (
          <div className="text-xs text-neutral-6 font-medium truncate">
            {product.shop.name}
          </div>
        )}

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-neutral-10 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating !== undefined && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="text-xs font-medium text-neutral-8 ml-1">
                {product.rating.toFixed(1)}
              </span>
            </div>
            {product.reviewCount !== undefined && (
              <span className="text-xs text-neutral-6">
                ({product.reviewCount})
              </span>
            )}
            {product.salesCount !== undefined && product.salesCount > 0 && (
              <span className="text-xs text-neutral-6 ml-2">
                Đã bán {product.salesCount}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto">
          {product.discount && product.discount > 0 ? (
            <>
              <span className="text-lg font-bold text-error">
                {formatPrice(product.finalPrice)}
              </span>
              <span className="text-sm text-neutral-6 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-primary-6">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock !== undefined && (
          <div className="text-xs">
            {product.stock > 0 ? (
              <span className="text-success">Còn hàng ({product.stock})</span>
            ) : (
              <span className="text-error">Hết hàng</span>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        {showAddToCart && (
          <Button
            size="sm"
            variant="solid"
            color="blue"
            fullWidth
            className="mt-2"
            onClick={handleAddToCartClick}
            icon={<ShoppingCart className="w-4 h-4" />}
            disabled={product.stock === 0}
          >
            Thêm vào giỏ
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CardProduct;

