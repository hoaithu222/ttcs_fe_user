import React from "react";
import { Package, ShoppingCart } from "lucide-react";
import Image from "@/foundation/components/icons/Image";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  productId?: string;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  productId,
  productName,
  productImage,
  productPrice,
  className = "",
}) => {
  const navigate = useNavigate();

  if (!productId || !productName) return null;

  const handleClick = () => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  return (
    <div
      className={`bg-background-2 rounded-lg border border-neutral-3 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="flex gap-3 p-3">
        {/* Product Image */}
        {productImage && (
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-2 flex-shrink-0">
            <Image
              src={productImage}
              alt={productName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <Package className="w-4 h-4 text-primary-6 flex-shrink-0 mt-0.5" />
            <h4 className="text-sm font-semibold text-neutral-10 line-clamp-2">{productName}</h4>
          </div>
          
          {productPrice !== undefined && productPrice > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-base font-bold text-primary-6">
                {formatPriceVND(productPrice)}
              </span>
            </div>
          )}

          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-6">
            <ShoppingCart className="w-3 h-3" />
            <span>Xem chi tiết sản phẩm</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;



