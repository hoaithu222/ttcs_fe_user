import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Section from "@/foundation/components/sections/Section";
import { Card } from "@/foundation/components/info/Card";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import ShopManagerLayout from "@/features/Shop/components/layouts/ShopManagerLayout";
import {
  getShopInfoStart,
  getProductsStart,
  getOrdersStart,
} from "@/features/Shop/slice/shop.slice";
import {
  selectShopInfo,
  selectShopInfoStatus,
  selectShopInfoError,
  selectProducts,
  selectProductsStatus,
  selectOrders,
  selectOrdersStatus,
  selectShopCurrentStatus,
} from "@/features/Shop/slice/shop.selector";
import { ReduxStateType } from "@/app/store/types";
import { ShopInfo } from "@/core/api/shop-management/type";
import { ShopStatus } from "@/features/Shop/slice/shop.type";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import { Store, Package, ShoppingCart, Settings, Users, DollarSign } from "lucide-react";
import { shopManagementApi } from "@/core/api/shop-management";
import {
  RevenueChart,
  InventoryChart,
  TopProductsChart,
  CustomerChart,
  RevenueProfitChart,
  WalletTransactionsChart,
  OrderStatusChart,
} from "@/features/Shop/components/analytics/charts";

const ShopDashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopInfo = useSelector(selectShopInfo) as ShopInfo | null;
  const shopInfoStatus = useSelector(selectShopInfoStatus);
  const shopInfoError = useSelector(selectShopInfoError);
  const products = useSelector(selectProducts);
  const productsStatus = useSelector(selectProductsStatus);
  const orders = useSelector(selectOrders);
  const ordersStatus = useSelector(selectOrdersStatus);
  const currentStatus = useSelector(selectShopCurrentStatus);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set(prev).add(id));
  };

  useEffect(() => {
    dispatch(getShopInfoStart());
    dispatch(getProductsStart({ page: 1, limit: 5 }));
    dispatch(getOrdersStart({ page: 1, limit: 5 }));

    // Fetch analytics
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError(null);
        const response = await shopManagementApi.getAnalytics({});
        if (response.success && response.data) {
          setAnalytics(response.data);
        } else {
          setAnalytics(null);
          setAnalyticsError(response.message || "Không thể tải dữ liệu thống kê");
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setAnalytics(null);
        setAnalyticsError("Lỗi kết nối khi tải dữ liệu thống kê");
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [dispatch]);

  // Refetch analytics when shop status changes to active/approved
  useEffect(() => {
    if (canEdit && !analyticsLoading) {
      const fetchAnalytics = async () => {
        try {
          setAnalyticsLoading(true);
          setAnalyticsError(null);
          const response = await shopManagementApi.getAnalytics({});
          if (response.success && response.data) {
            setAnalytics(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch analytics:", error);
          setAnalytics(null);
          setAnalyticsError("Lỗi kết nối khi tải dữ liệu thống kê");
        } finally {
          setAnalyticsLoading(false);
        }
      };

      // Only fetch if we don't have analytics data yet
      if (!analytics && !analyticsError) {
        fetchAnalytics();
      }
    }
  }, [analyticsLoading, analytics, analyticsError]);

  const isLoading =
    shopInfoStatus === ReduxStateType.LOADING ||
    productsStatus === ReduxStateType.LOADING ||
    ordersStatus === ReduxStateType.LOADING;

  const canEdit = true

  if (isLoading) {
    return (
      <ShopManagerLayout>
        <Loading layout="centered" message="Đang tải thông tin cửa hàng..." />
      </ShopManagerLayout>
    );
  }

  if (shopInfoError && !shopInfo) {
    return (
      <ShopManagerLayout>
        <Empty variant="default" title="Lỗi tải dữ liệu" description={shopInfoError || undefined} />
      </ShopManagerLayout>
    );
  }

  return (
    <ShopManagerLayout>
      <div className="space-y-6">
        {/* Shop Info Header */}
        {/* {shopInfo && (
          <Card className="mb-6">
            <div className="flex flex-col gap-6 items-start md:flex-row md:items-center">
              <div className="flex flex-1 gap-4 items-center">
                {shopInfo.logo && !imageErrors.has(`logo-${shopInfo._id}`) ? (
                  <img
                    src={
                      typeof shopInfo.logo === "string"
                        ? shopInfo.logo
                        : (shopInfo.logo as any)?.url || ""
                    }
                    alt={shopInfo.name}
                    className="object-cover w-20 h-20 rounded-lg border border-border-1"
                    onError={() => handleImageError(`logo-${shopInfo._id}`)}
                  />
                ) : (
                  <div className="flex justify-center items-center w-20 h-20 rounded-lg bg-primary-6">
                    <Store className="w-10 h-10 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="mb-1 text-2xl font-bold text-neutral-9">{shopInfo.name}</h1>
                  {shopInfo.description && (
                    <p className="text-sm text-neutral-6 line-clamp-2">{shopInfo.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-neutral-6">
                    {shopInfo.rating && (
                      <span>
                        ⭐ {shopInfo.rating.toFixed(1)} ({shopInfo.reviewCount || 0} đánh giá)
                      </span>
                    )}
                    {shopInfo.productsCount !== undefined && (
                      <span>• {shopInfo.productsCount} sản phẩm</span>
                    )}
                    {shopInfo.followersCount !== undefined && (
                      <span>• {shopInfo.followersCount} người theo dõi</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {canEdit && (
                  <Button
                    color="blue"
                    variant="outline"
                    size="md"
                    icon={<Settings className="w-5 h-5" />}
                    onClick={() => navigate(NAVIGATION_CONFIG.shop.path)}
                  >
                    Quản lý cửa hàng
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )} */}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="flex gap-4 items-center">
              <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-gradient-to-br from-primary-6 to-primary-8 text-white shadow-md">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-6">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-neutral-9">
                  {analytics?.revenue
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        notation: "compact",
                      }).format(analytics.revenue)
                    : "0đ"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="flex gap-4 items-center">
              <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-gradient-to-br from-success to-success/80 text-white shadow-md">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-6">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-neutral-9">
                  {analytics?.totalOrders || orders?.length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="flex gap-4 items-center">
              <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-gradient-to-br from-brand to-brand/80 text-white shadow-md">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-6">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-neutral-9">
                  {analytics?.productsCount || products?.length || shopInfo?.productsCount || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="flex gap-4 items-center">
              <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-gradient-to-br from-primary-8 to-primary-6 text-white shadow-md">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-6">Khách hàng thân thiết</p>
                <p className="text-2xl font-bold text-neutral-9">
                  {analytics?.topCustomers?.length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics Section */}
        {canEdit && (
          <>
            {/* Analytics Loading State */}
            {analyticsLoading && (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Loading size="md" />
                  <p className="text-sm text-neutral-6">Đang tải dữ liệu thống kê...</p>
                </div>
              </Card>
            )}

            {/* Analytics Error State */}
            {analyticsError && !analyticsLoading && (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Empty
                    variant="default"
                    title="Không thể tải dữ liệu thống kê"
                    description={analyticsError}
                    icon="warning"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        setAnalyticsLoading(true);
                        setAnalyticsError(null);
                        const response = await shopManagementApi.getAnalytics({});
                        if (response.success && response.data) {
                          setAnalytics(response.data);
                        } else {
                          setAnalyticsError(response.message || "Không thể tải dữ liệu thống kê");
                        }
                      } catch (error) {
                        setAnalyticsError("Lỗi kết nối khi tải dữ liệu thống kê");
                      } finally {
                        setAnalyticsLoading(false);
                      }
                    }}
                  >
                    Thử lại
                  </Button>
                </div>
              </Card>
            )}

            {/* Analytics Charts */}
            {!analyticsLoading && !analyticsError && analytics && (
              <>
                {/* Check if we have any chart data */}
                {(
                  (analytics.revenueVsProfit && Array.isArray(analytics.revenueVsProfit) && analytics.revenueVsProfit.length > 0) ||
                  (analytics.walletTransactions && Array.isArray(analytics.walletTransactions) && analytics.walletTransactions.length > 0) ||
                  (analytics.revenueByDate && Array.isArray(analytics.revenueByDate) && analytics.revenueByDate.length > 0) ||
                  (analytics.orderStatusWithColors && Array.isArray(analytics.orderStatusWithColors) && analytics.orderStatusWithColors.length > 0) ||
                  (analytics.inventory && typeof analytics.inventory === 'object') ||
                  (analytics.topProducts && Array.isArray(analytics.topProducts) && analytics.topProducts.length > 0) ||
                  (analytics.topCustomers && Array.isArray(analytics.topCustomers) && analytics.topCustomers.length > 0)
                ) ? (
                  <>
                    {/* New Charts Row */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {analytics?.revenueVsProfit && Array.isArray(analytics.revenueVsProfit) && analytics.revenueVsProfit.length > 0 && (
                        <RevenueProfitChart data={analytics.revenueVsProfit} />
                      )}
                      {analytics?.walletTransactions && Array.isArray(analytics.walletTransactions) && analytics.walletTransactions.length > 0 && (
                        <WalletTransactionsChart data={analytics.walletTransactions} />
                      )}
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {analytics?.revenueByDate && Array.isArray(analytics.revenueByDate) && analytics.revenueByDate.length > 0 && (
                        <RevenueChart data={analytics.revenueByDate} type="day" />
                      )}
                      {analytics?.orderStatusWithColors && Array.isArray(analytics.orderStatusWithColors) && analytics.orderStatusWithColors.length > 0 && (
                        <OrderStatusChart data={analytics.orderStatusWithColors} />
                      )}
                    </div>

                    {/* Third Row */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {analytics?.inventory && typeof analytics.inventory === 'object' && (
                        <InventoryChart
                          totalStock={analytics.inventory.totalStock || 0}
                          lowStockCount={analytics.inventory.lowStockCount || 0}
                          outOfStockCount={analytics.inventory.outOfStockCount || 0}
                          productsCount={analytics.productsCount || 0}
                        />
                      )}
                      {/* Placeholder for future chart */}
                      <div className="hidden lg:block"></div>
                    </div>

                    {analytics?.topProducts && Array.isArray(analytics.topProducts) && analytics.topProducts.length > 0 && (
                      <Section>
                        <TopProductsChart products={analytics.topProducts} />
                      </Section>
                    )}

                    {analytics?.topCustomers && Array.isArray(analytics.topCustomers) && analytics.topCustomers.length > 0 && (
                      <Section>
                        <CustomerChart customers={analytics.topCustomers} />
                      </Section>
                    )}
                  </>
                ) : (
                  <Card className="p-8">
                    <Empty
                      variant="default"
                      title="Chưa có dữ liệu thống kê"
                      description="Dữ liệu thống kê sẽ xuất hiện khi cửa hàng có hoạt động kinh doanh."
                      icon="chart"
                    />
                  </Card>
                )}
              </>
            )}
          </>
        )}

      </div>
    </ShopManagerLayout>
  );
};

export default ShopDashboardPage;
