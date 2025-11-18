import React, { useEffect, useState } from "react";
import { Store, Star, Package, MessageCircle, UserPlus, UserCheck } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { Product } from "@/core/api/products/type";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectProfile } from "@/features/Profile/slice/profile.selector";
import { userShopsApi } from "@/core/api/shops";
import { addToast } from "@/app/store/slices/toast";
import type { FollowStatusResponse } from "@/core/api/shops/type";

interface InfoShopProps {
  shop: Product["shop"];
}

const InfoShop: React.FC<InfoShopProps> = ({ shop }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const [isFollowing, setIsFollowing] = useState<boolean>(shop?.isFollowing ?? false);
  const [followersCount, setFollowersCount] = useState<number>(shop?.followersCount || 0);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnShop = Boolean(profile?.shop?.id && shop?._id && profile.shop.id === shop._id);

  if (!shop) return null;

  const handleShopClick = () => {
    if (shop._id) {
      navigate(`/shops/${shop._id}`);
    }
  };

  const applyFollowResponse = (data?: FollowStatusResponse) => {
    if (!data) return;
    if (typeof data.isFollowing === "boolean") {
      setIsFollowing(data.isFollowing);
    }
    if (typeof data.followersCount === "number") {
      setFollowersCount(data.followersCount);
    }
  };

  useEffect(() => {
    setIsFollowing(shop?.isFollowing ?? false);
    setFollowersCount(shop?.followersCount ?? 0);
  }, [shop?._id, shop?.isFollowing, shop?.followersCount]);

  useEffect(() => {
    let isMounted = true;
    if (!shop?._id || !profile?._id || isOwnShop) return;
    userShopsApi
      .getFollowingStatus(shop._id)
      .then((response) => {
        if (!isMounted) return;
        applyFollowResponse(response?.data);
      })
      .catch(() => {
        /* silent */
      });
    return () => {
      isMounted = false;
    };
  }, [shop?._id, profile?._id, isOwnShop]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shop?._id || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const response = await userShopsApi.unfollowShop(shop._id);
        applyFollowResponse(response?.data);
        dispatch(addToast({ type: "success", message: "Đã bỏ theo dõi cửa hàng" }));
      } else {
        const response = await userShopsApi.followShop(shop._id);
        applyFollowResponse(response?.data);
        dispatch(addToast({ type: "success", message: "Đã theo dõi cửa hàng" }));
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể cập nhật trạng thái theo dõi. Vui lòng thử lại.";
      dispatch(addToast({ type: "error", message }));
    } finally {
      setFollowLoading(false);
    }
  };

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement chat functionality
    console.log("Chat with shop:", shop._id);
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
            )}
            <Button
              color="gray"
              variant="outline"
              size="sm"
              onClick={handleChat}
              icon={<MessageCircle className="w-4 h-4" />}
            >
              Chat
            </Button>
            <Button color="blue" variant="outline" size="sm" onClick={handleShopClick}>
              Xem cửa hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoShop;
