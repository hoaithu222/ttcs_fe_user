import React, { useEffect, useState, useMemo } from "react";
import { Store, Star, Package, MessageCircle, UserPlus, UserCheck } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { Product } from "@/core/api/products/type";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { selectProfile } from "@/features/Profile/slice/profile.selector";
import { selectUser } from "@/features/Auth/components/slice/auth.selector";
import { addToast } from "@/app/store/slices/toast";
import { useShopFollowing } from "@/features/Profile/hooks/useShopFollowing";
import ShopChatModal from "@/features/Chat/components/ShopChatModal";

interface InfoShopProps {
  shop: Product["shop"];
}

const InfoShop: React.FC<InfoShopProps> = ({ shop }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const user = useAppSelector(selectUser) as any;
  const {
    isFollowing: checkIsFollowing,
    getFollowersCount,
    checkFollowingStatus,
    toggleFollowShop,
  } = useShopFollowing();
  const [followLoading, setFollowLoading] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const isOwnShop = Boolean(profile?.shop?.id && shop?._id && profile.shop.id === shop._id);
  const isLoggedIn = Boolean(user?._id && profile?._id);

  // Get follow status from Redux state
  const isFollowing = useMemo(() => {
    if (!shop?._id) return false;
    return checkIsFollowing(shop._id);
  }, [shop?._id, checkIsFollowing]);

  // Get followers count from Redux state
  const followersCount = useMemo(() => {
    if (!shop?._id) return 0;
    return getFollowersCount(shop._id);
  }, [shop?._id, getFollowersCount]);

  if (!shop) return null;

  const handleShopClick = () => {

    if (shop._id) {
      navigate(`/shops/${shop._id}`);
    }
  };

  // Check following status when shop changes
  useEffect(() => {
    if (shop?._id && profile?._id && !isOwnShop) {
      checkFollowingStatus(shop._id);
    }
  }, [shop?._id, profile?._id, isOwnShop, checkFollowingStatus]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shop?._id || followLoading) return;
    
    // Check if user is logged in
    if (!isLoggedIn) {
      dispatch(
        addToast({
          type: "error",
          message: "Vui lòng đăng nhập để theo dõi cửa hàng",
        })
      );
      navigate("/login");
      return;
    }
    
    setFollowLoading(true);
    try {
      await toggleFollowShop(shop._id);
    } catch (error) {
      // Error handling is done in useShopFollowing hook
    } finally {
      setFollowLoading(false);
    }
  };

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if user is logged in
    if (!isLoggedIn) {
      dispatch(
        addToast({
          type: "error",
          message: "Vui lòng đăng nhập để chat với cửa hàng",
        })
      );
      navigate("/login");
      return;
    }
    
    setIsChatModalOpen(true);
  };

  return (
    <div
      className="p-4 bg-background-1 rounded-lg border border-border-1 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleShopClick}
    >
      <div className="flex gap-4 items-start">
        {/* Shop Logo */}
        {shop.logo ? (
          <img
            src={shop.logo}
            alt={shop.name}
            className="w-16 h-16 rounded-lg object-cover border border-border-1"
          />
        ) : (
          <div className="flex justify-center items-center w-16 h-16 rounded-lg bg-primary-6 border border-border-1">
            <Store className="w-8 h-8 text-white" />
          </div>
        )}

        {/* Shop Info */}
        <div className="flex-1">
          <div className="flex gap-2 items-center mb-2">
            <h3 className="text-lg font-semibold text-neutral-9 hover:text-primary-6 transition-colors">
              {shop.name}
            </h3>
            {shop.rating !== undefined && shop.rating > 0 && (
              <div className="flex gap-1 items-center">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="text-sm text-neutral-6">{shop.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-4 items-center text-sm text-neutral-6 mb-3">
            <div className="flex gap-1 items-center">
              <Package className="w-4 h-4" />
              <span>Cửa hàng uy tín</span>
            </div>
            {followersCount > 0 && (
              <div className="flex gap-1 items-center">
                <UserPlus className="w-4 h-4" />
                <span>{followersCount} người theo dõi</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isOwnShop && (
              <>
                <Button
                  color={isFollowing ? "green" : "blue"}
                  variant={isFollowing ? "outline" : "solid"}
                  size="sm"
                  onClick={handleFollow}
                  disabled={followLoading}
                  icon={
                    isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />
                  }
                >
                  {isFollowing ? "Đã theo dõi" : "Theo dõi"}
                </Button>
                {/* <Button
                  color="gray"
                  variant="outline"
                  size="sm"
                  onClick={handleChat}
                  icon={<MessageCircle className="w-4 h-4" />}
                >
                  Chat
                </Button> */}
              </>
            )}
            <Button color="blue" variant="outline" size="sm" onClick={handleShopClick}>
              Xem cửa hàng
            </Button>
          </div>
        </div>
      </div>

      {/* Shop Chat Modal */}
      {shop?._id && (
        <ShopChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          shopId={shop._id}
          shopName={shop.name}
          shopAvatar={shop.logo}
        />
      )}
    </div>
  );
};

export default InfoShop;
