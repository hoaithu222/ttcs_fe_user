import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
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
// Icons - removed unused imports
import { shopManagementApi } from "@/core/api/shop-management";
import {
  RevenueChart,
  InventoryChart,
  TopProductsChart,
  CustomerChart,
  RevenueProfitChart,
  WalletTransactionsChart,
  OrderStatusChart,
  ProductPortfolioChart,
  CustomerTrendCompassChart,
  OrderForecastChart,
  OrderCancellationChart,
} from "@/features/Shop/components/analytics/charts";
import DateRangeFilter from "@/features/Shop/components/analytics/DateRangeFilter";

const ShopDashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopInfo = useSelector(selectShopInfo) as ShopInfo | null;
  const shopInfoStatus = useSelector(selectShopInfoStatus);
  const shopInfoError = useSelector(selectShopInfoError);
  const productsStatus = useSelector(selectProductsStatus);
  const ordersStatus = useSelector(selectOrdersStatus);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  
  // Initialize filters with calculated startDate and endDate from period
  const getInitialFilters = () => {
    const now = new Date();
    const to = new Date(now);
    const from = new Date(now);
    from.setDate(from.getDate() - 30); // Default to 30 days (month)
    
    return {
      period: "month" as const,
      startDate: from.toISOString().split("T")[0],
      endDate: to.toISOString().split("T")[0],
    };
  };
  
  const [filters, setFilters] = useState<{
    period?: "day" | "week" | "month" | "year" | "custom";
    startDate?: string;
    endDate?: string;
  }>(getInitialFilters());

  // New analytics data states
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [cancellationData, setCancellationData] = useState<any>(null);
  const [newAnalyticsLoading, setNewAnalyticsLoading] = useState(false);

  // Fetch analytics function (old analytics)
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      
      console.log("[ShopDashboard] Fetching analytics with filters:", filters);
      const response = await shopManagementApi.getAnalytics(filters);
      console.log("[ShopDashboard] Analytics API Response:", response);
      
      if (response.success && response.data) {
        console.log("[ShopDashboard] Analytics data received:", response.data);
        setAnalytics(response.data);
        setAnalyticsError(null);
      } else {
        console.warn("[ShopDashboard] Analytics API failed:", response.message, response);
        setAnalytics(null);
        setAnalyticsError(response.message || "Không thể tải dữ liệu thống kê");
      }
    } catch (error) {
      console.error("[ShopDashboard] Failed to fetch analytics:", error);
      setAnalytics(null);
      setAnalyticsError(error instanceof Error ? error.message : "Lỗi kết nối khi tải dữ liệu thống kê");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch new analytics function (4 new analytics)
  const fetchNewAnalytics = async () => {
    try {
      setNewAnalyticsLoading(true);
      
      console.log("[ShopDashboard] Fetching new analytics with filters:", filters);
      const [portfolio, trend, forecast, cancellation] = await Promise.all([
        shopManagementApi.getProductPortfolioAnalysis(filters),
        shopManagementApi.getCustomerTrendCompass(filters),
        shopManagementApi.getOrderForecast(filters),
        shopManagementApi.getOrderCancellationAnalysis(filters),
      ]);

      console.log("[ShopDashboard] New Analytics Responses:", {
        portfolio,
        trend,
        forecast,
        cancellation,
      });

      if (portfolio.success && portfolio.data) {
        console.log("[ShopDashboard] Portfolio data:", portfolio.data);
        setPortfolioData(portfolio.data);
      } else {
        console.warn("[ShopDashboard] Portfolio failed:", portfolio.message);
        setPortfolioData(null);
      }

      if (trend.success && trend.data) {
        console.log("[ShopDashboard] Trend data:", trend.data);
        setTrendData(trend.data);
      } else {
        console.warn("[ShopDashboard] Trend failed:", trend.message);
        setTrendData(null);
      }

      if (forecast.success && forecast.data) {
        console.log("[ShopDashboard] Forecast data:", forecast.data);
        setForecastData(forecast.data);
      } else {
        console.warn("[ShopDashboard] Forecast failed:", forecast.message);
        setForecastData(null);
      }

      if (cancellation.success && cancellation.data) {
        console.log("[ShopDashboard] Cancellation data:", cancellation.data);
        setCancellationData(cancellation.data);
      } else {
        console.warn("[ShopDashboard] Cancellation failed:", cancellation.message);
        setCancellationData(null);
      }
    } catch (error) {
      console.error("[ShopDashboard] Error fetching new analytics:", error);
      setPortfolioData(null);
      setTrendData(null);
      setForecastData(null);
      setCancellationData(null);
    } finally {
      setNewAnalyticsLoading(false);
    }
  };

  // Initial load - fetch shop info, products, orders
  useEffect(() => {
    dispatch(getShopInfoStart());
    dispatch(getProductsStart({ page: 1, limit: 5 }));
    dispatch(getOrdersStart({ page: 1, limit: 5 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Fetch all analytics when filters change (both old and new)
  useEffect(() => {
    fetchAnalytics();
    fetchNewAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (query: {
    period?: "day" | "week" | "month" | "year" | "custom";
    startDate?: string;
    endDate?: string;
  }) => {
    setFilters(query);
  };

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


        {/* Analytics Section */}
        {canEdit && (
          <>
            {/* Date Range Filter */}
            <div className="mb-6">
              <DateRangeFilter onFilterChange={handleFilterChange} currentQuery={filters} />
            </div>

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
                      await fetchAnalytics();
                      await fetchNewAnalytics();
                    }}
                  >
                    Thử lại
                  </Button>
                </div>
              </Card>
            )}

            {/* Analytics Empty State - No Data */}
            {!analyticsLoading && !analyticsError && !analytics && (
              <Card className="p-8">
                <Empty
                  variant="data"
                  title="Chưa có dữ liệu thống kê"
                  description="Chưa có dữ liệu thống kê để hiển thị. Hãy thử chọn khoảng thời gian khác."
                />
              </Card>
            )}

            {/* Analytics Charts */}
            {!analyticsLoading && !analyticsError && analytics && (
              <div className="space-y-6">
                {/* Debug Info - Remove in production */}
                {/* {process.env.NODE_ENV === "development" && (
                  <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <details className="text-xs">
                      <summary className="cursor-pointer font-semibold text-yellow-800">
                        Debug Info (Development Only)
                      </summary>
                      <pre className="mt-2 p-2 overflow-auto text-xs bg-white rounded border max-h-64">
                        {JSON.stringify({ analytics, portfolioData, trendData, forecastData, cancellationData }, null, 2)}
                      </pre>
                    </details>
                  </Card>
                )} */}

                {/* Gộp tất cả các chart dạng Card/Widget vào MỘT Grid duy nhất */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 auto-rows-min">
                  {/* 1. Doanh thu vs Lợi nhuận */}
                  {analytics.revenueVsProfit && analytics.revenueVsProfit.length > 0 && (
                    <RevenueProfitChart data={analytics.revenueVsProfit || []} />
                  )}

                  {/* 2. Giao dịch ví */}
                  {analytics.walletTransactions && analytics.walletTransactions.length > 0 && (
                    <WalletTransactionsChart data={analytics.walletTransactions || []} />
                  )}

                  {/* 3. Doanh thu theo ngày */}
                  {analytics.revenueByDate && analytics.revenueByDate.length > 0 && (
                    <RevenueChart data={analytics.revenueByDate || []} type="day" />
                  )}

                  {/* 4. Trạng thái đơn hàng */}
                  {analytics.orderStatusWithColors && analytics.orderStatusWithColors.length > 0 && (
                    <OrderStatusChart data={analytics.orderStatusWithColors || []} />
                  )}

                  {/* 5. Thống kê tồn kho */}
                  {analytics.inventory && (
                    <InventoryChart
                      totalStock={analytics.inventory?.totalStock || 0}
                      lowStockCount={analytics.inventory?.lowStockCount || 0}
                      outOfStockCount={analytics.inventory?.outOfStockCount || 0}
                      productsCount={analytics.productsCount || 0}
                    />
                  )}

                  {/* 6. Sản phẩm bán chạy */}
                  {analytics.topProducts && analytics.topProducts.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-border-1">
                      <h3 className="text-base font-bold text-neutral-9 mb-4">Sản phẩm bán chạy</h3>
                      <TopProductsChart products={analytics.topProducts} />
                    </div>
                  )}

                  {/* 7. Khách hàng thân thiết */}
                  {analytics.topCustomers && analytics.topCustomers.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-border-1">
                      <h3 className="text-base font-bold text-neutral-9 mb-4">Khách hàng thân thiết</h3>
                      <CustomerChart customers={analytics.topCustomers} />
                    </div>
                  )}
                </div>

                {/* CÁC SECTION LỚN (Full width) - Những chart này thường to nên để riêng bên dưới */}
                {/* Product Portfolio */}
                {(portfolioData || newAnalyticsLoading) && (
                  <Section>
                    <SectionTitle>Hiệu quả danh mục đầu tư/Sản phẩm</SectionTitle>
                    <ProductPortfolioChart data={portfolioData} isLoading={newAnalyticsLoading} />
                  </Section>
                )}

                {/* Trend Compass */}
                {(trendData?.trailData?.length > 0 || newAnalyticsLoading) && (
                  <Section>
                    <SectionTitle>"La bàn" xu hướng khách hàng</SectionTitle>
                    <CustomerTrendCompassChart
                      data={trendData?.trailData}
                      isLoading={newAnalyticsLoading}
                    />
                  </Section>
                )}

                {/* Order Forecast */}
                {(forecastData?.forecastData?.length > 0 || newAnalyticsLoading) && (
                  <Section>
                    <SectionTitle>Dự báo đơn hàng & Hiệu suất vận hành</SectionTitle>
                    <OrderForecastChart
                      data={forecastData?.forecastData}
                      isLoading={newAnalyticsLoading}
                    />
                  </Section>
                )}

                {/* Order Cancellation */}
                {(cancellationData?.cancellationData?.length > 0 || newAnalyticsLoading) && (
                  <Section>
                    <SectionTitle>Tỷ lệ hoàn/Hủy đơn & Lý do</SectionTitle>
                    <OrderCancellationChart
                      data={cancellationData?.cancellationData || []}
                      isLoading={newAnalyticsLoading}
                    />
                  </Section>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </ShopManagerLayout>
  );
};

export default ShopDashboardPage;
