import React, { useState } from "react";
import { Store, UserCheck, UserPlus, MessageCircle, Star } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { Shop } from "@/core/api/shops/type";
import { useShopFollowing } from "@/features/Profile/hooks/useShopFollowing";
import { useNavigate } from "react-router-dom";
import ShopChatModal from "@/features/Chat/components/ShopChatModal";

interface ShopHeaderProps {
  shop: Shop;
  isOwnShop?: boolean;
  onRefresh?: () => void;
}

const ShopHeader: React.FC<ShopHeaderProps> = ({ shop, isOwnShop = false, onRefresh }) => {
  const navigate = useNavigate();
  const { isFollowing, toggleFollowShop } = useShopFollowing();
  const [followLoading, setFollowLoading] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const isFollowingShop = isFollowing(shop._id);

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      await toggleFollowShop(shop._id);
      onRefresh?.();
    } catch (error) {
      // Error handling is done in useShopFollowing hook
    } finally {
      setFollowLoading(false);
    }
  };

  const handleChat = () => {
    setIsChatModalOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-background-1 border border-border-1 rounded-2xl p-5 shadow-sm">
      {/* Shop Logo & Name */}
      <div className="flex gap-4 items-center flex-1">
        <div className="relative flex-shrink-0">
          {shop.logo ? (
            <img
              src={shop.logo}
              alt={shop.name}
              className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover border-4 border-primary-6 shadow-lg ring-2 ring-primary-6/20"
            />
          ) : (
            <div className="flex justify-center items-center w-24 h-24 md:w-28 md:h-28 rounded-xl bg-gradient-to-br from-primary-6 to-primary-8 border-4 border-primary-6 shadow-lg">
              <Store className="w-12 h-12 md:w-14 md:h-14 text-white" />
            </div>
          )}
          {/* Online Status Badge */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-4 border-white shadow-md flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-9 truncate">{shop.name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success/10 rounded-full border border-success/20">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs text-success font-semibold">Đang hoạt động</span>
            </div>
            {shop.rating !== undefined && shop.rating > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-warning/10 rounded-full border border-warning/30">
                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                <span className="text-xs font-semibold text-neutral-9">{shop.rating.toFixed(1)}</span>
                <span className="text-xs text-neutral-6">
                  ({shop.reviewCount || 0})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 items-center">
        {!isOwnShop && (
          <>
            <Button
              color={isFollowingShop ? "green" : "blue"}
              variant={isFollowingShop ? "outline" : "solid"}
              size="md"
              onClick={handleFollow}
              disabled={followLoading}
              icon={
                isFollowingShop ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />
              }
            >
              {isFollowingShop ? "Đã theo dõi" : "Theo dõi"}
            </Button>
            <Button
              color="gray"
              variant="outline"
              size="md"
              onClick={handleChat}
              icon={<MessageCircle className="w-4 h-4" />}
            >
              Chat
            </Button>
          </>
        )}
        {isOwnShop && (
          <Button
            color="blue"
            variant="solid"
            size="md"
            onClick={() => navigate("/shop/dashboard")}
            icon={<Store className="w-4 h-4" />}
          >
            Quản lý cửa hàng
          </Button>
        )}
      </div>

      {/* Shop Chat Modal - No product metadata, just regular shop chat */}
      {shop?._id && (
        <ShopChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          shopId={shop._id}
          shopName={shop.name}
          shopAvatar={shop.logo}
          // No productId, productName, etc. - this is regular shop chat
        />
      )}
    </div>
  );
};

export default ShopHeader;

