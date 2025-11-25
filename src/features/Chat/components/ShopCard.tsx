import React from "react";
import { Store, Star, Users, Package, CheckCircle2 } from "lucide-react";
import Image from "@/foundation/components/icons/Image";
import { useNavigate } from "react-router-dom";

interface ShopCardProps {
  shopId?: string;
  shopName?: string;
  shopLogo?: string;
  shopDescription?: string;
  rating?: number;
  followCount?: number;
  productCount?: number;
  reviewCount?: number;
  isVerified?: boolean;
  className?: string;
}

const ShopCard: React.FC<ShopCardProps> = ({
  shopId,
  shopName,
  shopLogo,
  shopDescription,
  rating,
  followCount,
  productCount,
  reviewCount,
  isVerified,
  className = "",
}) => {
  const navigate = useNavigate();

  if (!shopId || !shopName) return null;

  const handleClick = () => {
    if (shopId) {
      navigate(`/shops/${shopId}`);
    }
  };

  return (
    <div
      className={`bg-background-2 rounded-lg border border-neutral-3 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="flex gap-3 p-3">
        {/* Shop Logo */}
        {shopLogo && (
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-2 flex-shrink-0">
            <Image
              src={shopLogo}
              alt={shopName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Shop Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <Store className="w-4 h-4 text-primary-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-semibold text-neutral-10 line-clamp-1">{shopName}</h4>
                {isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-primary-6 flex-shrink-0" title="Đã xác thực" />
                )}
              </div>
            </div>
          </div>

          {/* Rating */}
          {rating !== undefined && rating > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-5 fill-yellow-5" />
              <span className="text-xs font-medium text-neutral-8">
                {rating.toFixed(1)}
              </span>
              {reviewCount !== undefined && reviewCount > 0 && (
                <span className="text-xs text-neutral-6">
                  ({reviewCount} đánh giá)
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2 text-xs text-neutral-6">
            {followCount !== undefined && followCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{followCount}</span>
              </div>
            )}
            {productCount !== undefined && productCount > 0 && (
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span>{productCount}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {shopDescription && (
            <p className="text-xs text-neutral-7 line-clamp-2 mt-1.5">
              {shopDescription}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-6">
            <Store className="w-3 h-3" />
            <span>Xem cửa hàng</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;

