import React, { useState } from "react";
import { Package, ShoppingCart, ExternalLink, Loader2 } from "lucide-react";
import Image from "@/foundation/components/icons/Image";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import { useNavigate } from "react-router-dom";
import Button from "@/foundation/components/buttons/Button";
import { useAddToCart } from "@/features/Cart/hooks/useAddToCart";
import { userProductsApi } from "@/core/api/products";
import type { Product } from "@/core/api/products/type";

interface ProductCardProps {
  productId?: string;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  shopId?: string;
  shopName?: string;
  showActions?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  productId,
  productName,
  productImage,
  productPrice,
  shopId,
  shopName,
  showActions = true,
  className = "",
}) => {
  const navigate = useNavigate();
  const { addToCart } = useAddToCart();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  if (!productId || !productName) return null;

  const handleViewDetails = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!productId || !shopId) return;

    setIsLoading(true);
    try {
      // Fetch product details if not already loaded
      if (!product) {
        const response = await userProductsApi.getProduct(productId);
        if (response.success && response.data) {
          const productData = (response.data as any).product || response.data;
          setProduct(productData);
          
          // Add to cart
          addToCart(productData, 1, null, { showToast: true });
        }
      } else {
        // Product already loaded, add to cart directly
        addToCart(product, 1, null, { showToast: true });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Fallback: navigate to product page
      handleViewDetails();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`bg-background-2 rounded-lg border border-neutral-3 overflow-hidden shadow-sm hover:shadow-md transition-all ${className}`}
    >
      <div className="flex gap-3 p-3">
        {/* Product Image */}
        {productImage && (
          <div 
            className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-2 flex-shrink-0 cursor-pointer"
            onClick={handleViewDetails}
          >
            <Image
              src={productImage}
              alt={productName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div 
            className="flex items-start gap-2 mb-1 cursor-pointer"
            onClick={handleViewDetails}
          >
            <Package className="w-4 h-4 text-primary-6 flex-shrink-0 mt-0.5" />
            <h4 className="text-sm font-semibold text-neutral-10 line-clamp-2 hover:text-primary-6 transition-colors">{productName}</h4>
          </div>
          
          {shopName && (
            <p className="text-xs text-neutral-6 mt-0.5">Từ: {shopName}</p>
          )}
          
          {productPrice !== undefined && productPrice > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-base font-bold text-primary-6">
                {formatPriceVND(productPrice)}
              </span>
            </div>
          )}

          {/* Quick Actions */}
          {showActions && (
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddToCart}
                disabled={isLoading || !shopId}
                className="flex-1 text-xs"
                icon={isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShoppingCart className="w-3 h-3" />}
              >
                {isLoading ? "Đang thêm..." : "Thêm vào giỏ"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewDetails}
                className="flex-1 text-xs"
                icon={<ExternalLink className="w-3 h-3" />}
              >
                Xem chi tiết
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;




