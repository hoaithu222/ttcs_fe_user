import React, { useEffect, useState } from "react";
import Page from "@/foundation/components/layout/Page";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import { shopManagementApi } from "@/core/api/shop-management";
import { TrendingUp, DollarSign, Package, ShoppingCart } from "lucide-react";

import { RevenueData, WalletTransactionData, OrderStatusData } from "./charts";
import {
  ProductPortfolioChart,
  CustomerTrendCompassChart,
  OrderForecastChart,
  OrderCancellationChart,
} from "./charts";
import DateRangeFilter from "./DateRangeFilter";

interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  period?: "day" | "week" | "month" | "year" | "custom";
}

interface AnalyticsData {
  revenue: number;
  totalOrders: number;
  productsCount: number;
  ordersByStatus: Record<string, number>;
  topProducts: Array<{
    _id: string;
    productName: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  // New analytics data
  revenueVsProfit?: RevenueData[];
  walletTransactions?: WalletTransactionData[];
  orderStatusWithColors?: OrderStatusData[];
  inventory?: {
    totalStock: number;
    lowStockCount: number;
    outOfStockCount: number;
    productsWithVariants: number;
  };
  topCustomers?: Array<any>;
  revenueByDate?: Array<any>;
  revenueByMonth?: Array<any>;
  productsByCategory?: Array<any>;
}

const Analytic: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsQuery>({ period: "month" });

  // New analytics data states
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [cancellationData, setCancellationData] = useState<any>(null);
  const [isLoadingNew, setIsLoadingNew] = useState(false);

  const fetchAnalytics = async (query: AnalyticsQuery = {}) => {
    try {
      setIsLoading(true);
      const response = await shopManagementApi.getAnalytics({
        period: query.period,
        startDate: query.startDate,
        endDate: query.endDate,
      });
      if (response.data) {
        setAnalytics(response.data as AnalyticsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thống kê");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNewAnalytics = async (query: AnalyticsQuery = {}) => {
    try {
      setIsLoadingNew(true);
      const [portfolio, trend, forecast, cancellation] = await Promise.all([
        shopManagementApi.getProductPortfolioAnalysis(query),
        shopManagementApi.getCustomerTrendCompass(query),
        shopManagementApi.getOrderForecast(query),
        shopManagementApi.getOrderCancellationAnalysis(query),
      ]);

      if (portfolio.data) setPortfolioData(portfolio.data);
      if (trend.data) setTrendData(trend.data);
      if (forecast.data) setForecastData(forecast.data);
      if (cancellation.data) setCancellationData(cancellation.data);
    } catch (err) {
      console.error("Error fetching new analytics:", err);
    } finally {
      setIsLoadingNew(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(filters);
    fetchNewAnalytics(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (query: AnalyticsQuery) => {
    setFilters(query);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (isLoading) {
    return (
      <Page>
        <Loading layout="centered" message="Đang tải thống kê..." />
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <Empty variant="default" title="Lỗi tải dữ liệu" description={error || undefined} />
      </Page>
    );
  }

  if (!analytics) {
    return (
      <Page>
        <Empty variant="data" title="Chưa có dữ liệu" description="Chưa có thống kê nào" />
      </Page>
    );
  }

  const stats = [
    {
      label: "Tổng doanh thu",
      value: formatPrice(analytics.revenue),
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-success/20 text-success",
    },
    {
      label: "Tổng đơn hàng",
      value: analytics.totalOrders.toString(),
      icon: <ShoppingCart className="w-6 h-6" />,
      color: "bg-primary-6/20 text-primary-6",
    },
    {
      label: "Sản phẩm",
      value: analytics.productsCount.toString(),
      icon: <Package className="w-6 h-6" />,
      color: "bg-brand/20 text-brand",
    },
    {
      label: "Đơn đã giao",
      value: (analytics.ordersByStatus.delivered || 0).toString(),
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-primary-8/20 text-primary-8",
    },
  ];

  return (
    <Page>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex gap-4 items-center mb-6">
          <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary-6">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-9">Thống kê cửa hàng</h1>
            <p className="text-sm text-neutral-6">Theo dõi hiệu suất kinh doanh của cửa hàng</p>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6">
          <DateRangeFilter onFilterChange={handleFilterChange} currentQuery={filters} />
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-6 rounded-lg border bg-background-1 border-border-1"
            >
              <div
                className={`flex justify-center items-center w-12 h-12 rounded-lg ${stat.color}`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-6">{stat.label}</p>
                <p className="text-2xl font-bold text-neutral-9">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <Section>
          <SectionTitle>Đơn hàng theo trạng thái</SectionTitle>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
              <div
                key={status}
                className="p-4 text-center rounded-lg border bg-background-1 border-border-1"
              >
                <p className="mb-1 text-2xl font-bold text-primary-6">{count}</p>
                <p className="text-sm capitalize text-neutral-6">{status}</p>
              </div>
            ))}
          </div>
        </Section>

        {analytics.topProducts && analytics.topProducts.length > 0 && (
          <Section>
            <SectionTitle>Sản phẩm bán chạy</SectionTitle>
            <div className="space-y-2">
              {analytics.topProducts.map((product, idx) => (
                <div
                  key={product._id}
                  className="flex gap-4 justify-between items-center p-4 rounded-lg border bg-background-1 border-border-1"
                >
                  <div className="flex gap-4 items-center">
                    <div className="flex justify-center items-center w-10 h-10 font-bold text-white rounded-full bg-primary-6">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-9">{product.productName}</p>
                      <p className="text-sm text-neutral-6">Đã bán: {product.totalSold}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-6">{formatPrice(product.totalRevenue)}</p>
                    <p className="text-xs text-neutral-6">Doanh thu</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 1. Product Portfolio Analysis */}
        <Section>
          <SectionTitle>Hiệu quả danh mục đầu tư/Sản phẩm</SectionTitle>
          <ProductPortfolioChart data={portfolioData} isLoading={isLoadingNew} />
        </Section>

        {/* 2. Customer Trend Compass */}
        <Section>
          <SectionTitle>"La bàn" xu hướng khách hàng</SectionTitle>
          <CustomerTrendCompassChart data={trendData?.trailData} isLoading={isLoadingNew} />
        </Section>

        {/* 3. Order Forecast */}
        <Section>
          <SectionTitle>Dự báo đơn hàng & Hiệu suất vận hành</SectionTitle>
          <OrderForecastChart data={forecastData?.forecastData} isLoading={isLoadingNew} />
        </Section>

        {/* 4. Order Cancellation Analysis */}
        <Section>
          <SectionTitle>Tỷ lệ hoàn/Hủy đơn & Lý do</SectionTitle>
          <OrderCancellationChart data={cancellationData?.cancellationData} isLoading={isLoadingNew} />
        </Section>
      </div>
    </Page>
  );
};

export default Analytic;
