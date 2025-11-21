import React from "react";
import { Package, UserPlus, MessageCircle, Star, Calendar } from "lucide-react";
import { Shop } from "@/core/api/shops/type";

interface ShopStatsProps {
  shop: Shop;
}

const ShopStats: React.FC<ShopStatsProps> = ({ shop }) => {
  const formatFollowersCount = (count?: number): string => {
    if (!count) return "0";
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const formatDateJoined = (dateString?: string): string => {
    if (!dateString) return "Chưa rõ";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffYears = now.getFullYear() - date.getFullYear();
      if (diffYears > 0) {
        return `${diffYears} năm trước`;
      }
      const diffMonths = now.getMonth() - date.getMonth();
      if (diffMonths > 0) {
        return `${diffMonths} tháng trước`;
      }
      return "Gần đây";
    } catch {
      return "Chưa rõ";
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Products Count */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-neutral-6">
          <Package className="w-4 h-4" />
          <span className="text-sm">Sản Phẩm</span>
        </div>
        <span className="text-lg font-bold text-neutral-9">
          {shop.productsCount !== undefined ? shop.productsCount : shop.productCount || 0}
        </span>
      </div>

      {/* Following Count */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-neutral-6">
          <UserPlus className="w-4 h-4" />
          <span className="text-sm">Đang Theo</span>
        </div>
        <span className="text-lg font-bold text-neutral-9">-</span>
      </div>

      {/* Chat Response Rate */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-neutral-6">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">Tỉ Lệ Phản Hồi Chat</span>
        </div>
        <span className="text-lg font-bold text-success">99%</span>
        <span className="text-xs text-neutral-5">(Trong Vài Giờ)</span>
      </div>

      {/* Followers Count */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-neutral-6">
          <UserPlus className="w-4 h-4" />
          <span className="text-sm">Người Theo Dõi</span>
        </div>
        <span className="text-lg font-bold text-neutral-9">
          {formatFollowersCount(shop.followersCount || (shop as any).followCount || 0)}
        </span>
      </div>

      {/* Rating */}
      {shop.rating !== undefined && shop.rating > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-neutral-6">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="text-sm">Đánh Giá</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-neutral-9">{shop.rating.toFixed(1)}</span>
            <span className="text-xs text-neutral-5">
              ({formatFollowersCount(shop.reviewCount)} Đánh Giá)
            </span>
          </div>
        </div>
      )}

      {/* Joined Date */}
      {shop.createdAt && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-neutral-6">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Tham Gia</span>
          </div>
          <span className="text-lg font-bold text-neutral-9">{formatDateJoined(shop.createdAt)}</span>
        </div>
      )}
    </div>
  );
};

export default ShopStats;

