import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Star, Package, UserPlus, UserCheck } from "lucide-react";
import Page from "@/foundation/components/layout/Page";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import Button from "@/foundation/components/buttons/Button";
import { userShopsApi } from "@/core/api/shops";
import type { Shop } from "@/core/api/shops/type";
import { useShopFollowing } from "@/features/Profile/hooks/useShopFollowing";
import { selectShopFollowing } from "@/features/Profile/slice/profile.selector";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { addToast } from "@/app/store/slices/toast";

const FollowingShopsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toggleFollowShop } = useShopFollowing();
  const shopFollowingData = useAppSelector(selectShopFollowing);

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  // Get list of shop IDs that user is following from Redux state
  const followingShopIds = useMemo(() => {
    return Object.keys(shopFollowingData).filter(
      (shopId) => shopFollowingData[shopId]?.isFollowing === true
    );
  }, [shopFollowingData]);

  useEffect(() => {
    const fetchFollowingShops = async () => {
      try {
        setLoading(true);
        setError(null);

        if (followingShopIds.length === 0) {
          setShops([]);
          setLoading(false);
          return;
        }

        // Fetch shop details for each following shop ID
        const shopPromises = followingShopIds.map((shopId) => userShopsApi.getShop(shopId));
        const responses = await Promise.all(shopPromises);

        const fetchedShops: Shop[] = [];
        for (const response of responses) {
          if (response.success && response.data) {
            const shopData = (response.data as any)?.shop || response.data;
            if (shopData && shopData._id) {
              fetchedShops.push(shopData as Shop);
            }
          }
        }

        setShops(fetchedShops);
      } catch (err: any) {
        console.error("Error fetching following shops:", err);
        setError(err?.response?.data?.message || "Không thể tải danh sách cửa hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingShops();
  }, [followingShopIds]);

  const handleToggleFollow = async (shopId: string) => {
    if (followLoading[shopId]) return;
    setFollowLoading((prev) => ({ ...prev, [shopId]: true }));
    try {
      await toggleFollowShop(shopId);
      // Remove from list if unfollowed
      setShops((prev) => prev.filter((shop) => shop._id !== shopId));
      dispatch(addToast({ type: "success", message: "Đã bỏ theo dõi cửa hàng" }));
    } catch (error) {
      // Error handling is done in useShopFollowing hook
    } finally {
      setFollowLoading((prev) => ({ ...prev, [shopId]: false }));
    }
  };

  const handleShopClick = (shopId: string) => {
    navigate(`/shops/${shopId}`);
  };

  if (loading) {
    return (
      <Page>
        <div className="container mx-auto px-4 py-8">
          <Loading layout="centered" message="Đang tải danh sách cửa hàng đã theo dõi..." />
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <div className="container mx-auto px-4 py-8">
          <Empty
            variant="default"
            title="Lỗi"
            description={error}
            action={
              <Button color="blue" variant="solid" onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            }
          />
        </div>
      </Page>
    );
  }

  if (shops.length === 0) {
    return (
      <Page>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-neutral-9 mb-2">Cửa hàng đã theo dõi</h1>
            <p className="text-neutral-6">Danh sách các cửa hàng bạn đang theo dõi</p>
          </div>
          <Empty
            variant="default"
            title="Chưa theo dõi cửa hàng nào"
            description="Bạn chưa theo dõi cửa hàng nào. Hãy khám phá và theo dõi các cửa hàng yêu thích!"
            action={
              <Button color="blue" variant="solid" onClick={() => navigate("/products")}>
                Khám phá sản phẩm
              </Button>
            }
          />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-9 mb-2">Cửa hàng đã theo dõi</h1>
          <p className="text-neutral-6">{shops.length} cửa hàng đang theo dõi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div
              key={shop._id}
              className="bg-background-2 rounded-lg border border-border-1 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleShopClick(shop._id)}
            >
              <div className="flex gap-4 items-start mb-4">
                {/* Shop Logo */}
                {shop.logo ? (
                  <img
                    src={shop.logo}
                    alt={shop.name}
                    className="w-16 h-16 rounded-lg object-cover border border-border-1 flex-shrink-0"
                  />
                ) : (
                  <div className="flex justify-center items-center w-16 h-16 rounded-lg bg-primary-6 border border-border-1 flex-shrink-0">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                )}

                {/* Shop Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-neutral-9 mb-1 truncate">{shop.name}</h3>
                  {shop.rating !== undefined && shop.rating > 0 && (
                    <div className="flex gap-1 items-center mb-1">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="text-sm text-neutral-6">{shop.rating.toFixed(1)}</span>
                      {shop.reviewCount !== undefined && shop.reviewCount > 0 && (
                        <span className="text-xs text-neutral-5">({shop.reviewCount})</span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-3 items-center text-xs text-neutral-6">
                    {shop.productsCount !== undefined && (
                      <div className="flex gap-1 items-center">
                        <Package className="w-3 h-3" />
                        <span>{shop.productsCount} sản phẩm</span>
                      </div>
                    )}
                    {shop.followersCount !== undefined && (
                      <div className="flex gap-1 items-center">
                        <UserPlus className="w-3 h-3" />
                        <span>{shop.followersCount} người theo dõi</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {shop.description && (
                <p className="text-sm text-neutral-7 line-clamp-2 mb-4">{shop.description}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  color="blue"
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShopClick(shop._id);
                  }}
                >
                  Xem cửa hàng
                </Button>
                <Button
                  color="red"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFollow(shop._id);
                  }}
                  disabled={followLoading[shop._id]}
                  icon={<UserCheck className="w-4 h-4" />}
                >
                  Bỏ theo dõi
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
};

export default FollowingShopsPage;

