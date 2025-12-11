import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import Page from "@/foundation/components/layout/Page";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import Button from "@/foundation/components/buttons/Button";
import { userShopsApi } from "@/core/api/shops";
import type { Shop } from "@/core/api/shops/type";
import { useShopFollowing } from "@/features/Profile/hooks/useShopFollowing";
import { selectProfile } from "@/features/Profile/slice/profile.selector";
import { useAppSelector } from "@/app/store";
import ShopHeader from "../components/shop-detail/ShopHeader";
import ShopStats from "../components/shop-detail/ShopStats";
import ShopProducts from "../components/shop-detail/ShopProducts";
import ShopBanner from "../components/shop-detail/ShopBanner";
import ShopInfo from "../components/shop-detail/ShopInfo";

const ShopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const profile = useAppSelector(selectProfile);
  const { checkFollowingStatus } = useShopFollowing();

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const isOwnShop = useMemo(() => {
    if (!shop?._id || !profile?.shop?.id) return false;
    return shop._id === profile.shop.id;
  }, [shop?._id, profile?.shop?.id]);

  const fetchShopDetail = React.useCallback(async () => {
    if (!id) {
      setError("Shop ID không hợp lệ");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await userShopsApi.getShop(id);
      const shopData = (response.data as any)?.data || (response.data as any);
      if (shopData && shopData._id) {
        setShop(shopData as Shop);
        const isOwn = profile?.shop?.id && shopData._id === profile.shop.id;
        const isLoggedIn = !!profile?.id;
        if (isLoggedIn && !isOwn) {
          checkFollowingStatus(shopData._id);
        }
      } else {
        setError("Không tìm thấy thông tin cửa hàng");
      }
    } catch (err: any) {
      console.error("Error fetching shop:", err);
      setError(err?.response?.data?.message || "Không thể tải thông tin cửa hàng");
    } finally {
      setLoading(false);
    }
  }, [id, profile?.shop?.id, profile?.id, checkFollowingStatus]);

  // Fetch shop detail on mount / id change
  useEffect(() => {
    fetchShopDetail();
  }, [fetchShopDetail]);


  if (loading) {
    return (
      <Page>
        <div className="container mx-auto px-4 py-8">
          <Loading layout="centered" message="Đang tải thông tin cửa hàng..." />
        </div>
      </Page>
    );
  }

  if (error || !shop) {
    return (
      <Page>
        <div className="container mx-auto px-4 py-8">
          <Empty
            variant="default"
            title="Không tìm thấy cửa hàng"
            description={error || "Cửa hàng không tồn tại hoặc đã bị xóa"}
            action={
              <Button color="blue" variant="solid" onClick={() => navigate("/products")}>
                Quay lại danh sách sản phẩm
              </Button>
            }
          />
        </div>
      </Page>
    );
  }

  const shopWithExtras = shop as any;

  return (
    <Page>
      <div className="min-h-screen bg-background-1">
        {/* Breadcrumb Navigation */}
        <div className="bg-background-2 border-b border-border-1">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
              <Link
                to="/"
                className="flex items-center gap-1 text-neutral-6 hover:text-primary-6 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Trang chủ</span>
              </Link>
            

              <ChevronRight className="w-4 h-4 text-neutral-4" />
              <span className="text-neutral-9 font-medium truncate max-w-xs" title={shop.name}>
                {shop.name}
              </span>
            </nav>
          </div>
        </div>

        {/* Shop Banner */}
        {shopWithExtras.banner && (
          <div className="container mx-auto px-4 py-3">
            <ShopBanner
              banner={shopWithExtras.banner}
              logo={shop.logo}
              name={shop.name}
            />
          </div>
        )}

        {/* Shop Header */}
        <div className="bg-background-2 border-b border-border-1">
          <div className="container mx-auto px-4 py-3">
            <ShopHeader shop={shop} isOwnShop={isOwnShop} onRefresh={fetchShopDetail} />
          </div>
        </div>

        {/* Shop Stats */}
        {shop && (
          <div className="bg-background-1">
            <div className="container mx-auto px-4 py-3">
              <ShopStats shop={shop} />
            </div>
          </div>
        )}

        {/* Shop Info Section */}
        <div className="container mx-auto px-4 py-3">
          <ShopInfo shop={shopWithExtras} />
        </div>

        {/* Shop Products */}
        <div className="container mx-auto px-4 py-3">
          <ShopProducts
            shopId={shop._id}
            initialProducts={[]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </Page>
  );
};

export default ShopDetailPage;

