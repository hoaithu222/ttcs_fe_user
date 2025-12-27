import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card } from "@/foundation/components/info/Card";
import { TrendingUp, Star, AlertCircle } from "lucide-react";
import Empty from "@/foundation/components/empty/Empty";

interface ProductPortfolioData {
  cashCows: {
    count: number;
    revenue: number;
    percentage: number;
    products: Array<{ productId: string; productName: string; revenue: number }>;
  };
  stars: {
    count: number;
    revenue: number;
    percentage: number;
    products: Array<{ productId: string; productName: string; revenue: number }>;
  };
  dogs: {
    count: number;
    revenue: number;
    percentage: number;
    products: Array<{ productId: string; productName: string; revenue: number }>;
  };
  topStarsForAds: Array<{
    productId: string;
    productName: string;
    revenue: number;
    quantity: number;
    viewCount: number;
  }>;
}

interface ProductPortfolioChartProps {
  data: ProductPortfolioData | null;
  isLoading?: boolean;
}

const COLORS = {
  cashCows: "#22c55e", // Green
  stars: "#f59e0b", // Amber/Yellow
  dogs: "#ef4444", // Red
};

const ProductPortfolioChart: React.FC<ProductPortfolioChartProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-neutral-6">Đang tải dữ liệu...</p>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6">
        <Empty variant="data" title="Chưa có dữ liệu" description="Chưa có thống kê danh mục sản phẩm" />
      </Card>
    );
  }

  const pieData = [
    {
      name: "Cash Cows (30%)",
      value: data.cashCows.percentage,
      count: data.cashCows.count,
      revenue: data.cashCows.revenue,
      color: COLORS.cashCows,
    },
    {
      name: "Stars (20%)",
      value: data.stars.percentage,
      count: data.stars.count,
      revenue: data.stars.revenue,
      color: COLORS.stars,
    },
    {
      name: "Dogs (50%)",
      value: data.dogs.percentage,
      count: data.dogs.count,
      revenue: data.dogs.revenue,
      color: COLORS.dogs,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-primary-6" />
          <h3 className="text-lg font-semibold text-neutral-9">Hiệu quả danh mục đầu tư/Sản phẩm</h3>
        </div>
        <p className="text-sm text-neutral-6">
          Phân tích danh mục sản phẩm theo quy luật 80/20
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => {
                  const data = props.payload;
                  return [
                    `${value.toFixed(1)}% (${data.count} sản phẩm, ${formatCurrency(data.revenue)})`,
                    name,
                  ];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 Stars List */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500" />
            <h4 className="font-semibold text-neutral-9">Top 5 sản phẩm tăng trưởng (Quảng cáo ngay)</h4>
          </div>
          <div className="space-y-3">
            {data.topStarsForAds.length > 0 ? (
              data.topStarsForAds.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-background-1 border-border-1 hover:border-primary-5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-9">{product.productName}</p>
                      <p className="text-xs text-neutral-6">
                        {product.quantity} đã bán • {product.viewCount} lượt xem
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-6">{formatCurrency(product.revenue)}</p>
                    <p className="text-xs text-neutral-6">Doanh thu</p>
                  </div>
                </div>
              ))
            ) : (
              <Empty variant="data" title="Chưa có dữ liệu" description="Chưa có sản phẩm tăng trưởng" />
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-3 gap-4 p-4 rounded-lg bg-neutral-1 border border-border-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <div>
            <p className="text-sm font-semibold text-neutral-9">Cash Cows (30%)</p>
            <p className="text-xs text-neutral-6">
              {data.cashCows.count} sản phẩm • {formatCurrency(data.cashCows.revenue)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-500"></div>
          <div>
            <p className="text-sm font-semibold text-neutral-9">Stars (20%)</p>
            <p className="text-xs text-neutral-6">
              {data.stars.count} sản phẩm • {formatCurrency(data.stars.revenue)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <div>
            <p className="text-sm font-semibold text-neutral-9">Dogs (50%)</p>
            <p className="text-xs text-neutral-6">
              {data.dogs.count} sản phẩm • {formatCurrency(data.dogs.revenue)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductPortfolioChart;

