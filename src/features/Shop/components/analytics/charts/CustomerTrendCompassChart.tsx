import React, { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Card } from "@/foundation/components/info/Card";
import { Compass } from "lucide-react";
import Empty from "@/foundation/components/empty/Empty";

interface TrailDataPoint {
  date: string;
  productId: string;
  productName: string;
  views: number;
  addToCart: number;
}

interface CustomerTrendCompassChartProps {
  data: TrailDataPoint[] | null;
  isLoading?: boolean;
  selectedProductId?: string;
}

const CustomerTrendCompassChart: React.FC<CustomerTrendCompassChartProps> = ({
  data,
  isLoading,
  selectedProductId,
}) => {
  const chartData = useMemo(() => {
    if (!data) return [];

    // Filter by product if selected
    let filteredData = data;
    if (selectedProductId) {
      filteredData = data.filter((d) => d.productId === selectedProductId);
    }

    // Group by date and calculate cumulative
    const byDate: Record<string, TrailDataPoint[]> = {};
    filteredData.forEach((point) => {
      if (!byDate[point.date]) {
        byDate[point.date] = [];
      }
      byDate[point.date].push(point);
    });

    // Calculate cumulative values for trail effect
    const sortedDates = Object.keys(byDate).sort();
    const trailPoints: Array<{
      date: string;
      views: number;
      addToCart: number;
      productName: string;
    }> = [];

    sortedDates.forEach((date) => {
      const dayData = byDate[date];
      const totalViews = dayData.reduce((sum, d) => sum + d.views, 0);
      const totalAddToCart = dayData.reduce((sum, d) => sum + d.addToCart, 0);
      const productName = dayData[0]?.productName || "Sản phẩm";

      trailPoints.push({
        date,
        views: totalViews,
        addToCart: totalAddToCart,
        productName,
      });
    });

    return trailPoints;
  }, [data, selectedProductId]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-neutral-6">Đang tải dữ liệu...</p>
        </div>
      </Card>
    );
  }

  if (!data || chartData.length === 0) {
    return (
      <Card className="p-6">
        <Empty variant="data" title="Chưa có dữ liệu" description="Chưa có dữ liệu xu hướng khách hàng" />
      </Card>
    );
  }

  const maxViews = Math.max(...chartData.map((d) => d.views), 1);
  const maxAddToCart = Math.max(...chartData.map((d) => d.addToCart), 1);

  // Determine trend direction
  const firstPoint = chartData[0];
  const lastPoint = chartData[chartData.length - 1];
  const trendDirection =
    lastPoint.views > firstPoint.views && lastPoint.addToCart > firstPoint.addToCart
      ? "good" // Hướng về góc phải trên
      : lastPoint.views > firstPoint.views && lastPoint.addToCart <= firstPoint.addToCart
      ? "warning" // Xem nhiều nhưng không thêm giỏ
      : "bad"; // Cắm đầu xuống

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-5 h-5 text-primary-6" />
          <h3 className="text-lg font-semibold text-neutral-9">"La bàn" xu hướng khách hàng</h3>
        </div>
        <p className="text-sm text-neutral-6">
          Hành vi khách hàng đối với sản phẩm trong 7 ngày qua
        </p>
      </div>

      {/* Trend Indicator */}
      <div
        className={`mb-4 p-3 rounded-lg ${
          trendDirection === "good"
            ? "bg-green-50 border border-green-200"
            : trendDirection === "warning"
            ? "bg-amber-50 border border-amber-200"
            : "bg-red-50 border border-red-200"
        }`}
      >
        <p className="text-sm font-semibold">
          {trendDirection === "good"
            ? "✅ Tốt: Khách hàng xem nhiều và thêm vào giỏ nhiều"
            : trendDirection === "warning"
            ? "⚠️ Cảnh báo: Khách xem nhiều nhưng không thêm giỏ - Cần sửa giá hoặc mô tả"
            : "❌ Xấu: Xu hướng giảm - Cần cải thiện"}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="addToCart"
            name="Thêm vào giỏ"
            label={{ value: "Số lượt thêm vào giỏ", position: "insideBottom", offset: -5 }}
            domain={[0, maxAddToCart * 1.1]}
          />
          <YAxis
            type="number"
            dataKey="views"
            name="Lượt xem"
            label={{ value: "Số lượt xem", angle: -90, position: "insideLeft" }}
            domain={[0, maxViews * 1.1]}
          />
          <Tooltip
            formatter={(value: number, name: string, props: any) => {
              return [value, name === "views" ? "Lượt xem" : "Thêm vào giỏ"];
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return `Ngày: ${payload[0].payload.date}`;
              }
              return label;
            }}
          />
          <ReferenceLine
            x={maxAddToCart / 2}
            stroke="#9ca3af"
            strokeDasharray="2 4"
            label={{ value: "TB Thêm giỏ", position: "top" }}
          />
          <ReferenceLine
            y={maxViews / 2}
            stroke="#9ca3af"
            strokeDasharray="2 4"
            label={{ value: "TB Lượt xem", position: "right" }}
          />
          <Scatter name="Xu hướng" data={chartData} fill="#3b82f6">
            {chartData.map((entry, index) => {
              // Color based on position: top-right = green, bottom = red
              const isTopRight =
                entry.views > maxViews / 2 && entry.addToCart > maxAddToCart / 2;
              const isBottom = entry.views < maxViews / 3 || entry.addToCart < maxAddToCart / 3;
              const color = isTopRight ? "#22c55e" : isBottom ? "#ef4444" : "#3b82f6";

              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <div className="mt-4 text-xs text-neutral-6">
        <p>
          * Trục X: Số lượt thêm vào giỏ | Trục Y: Số lượt xem | Đường di chuyển: 7 ngày qua
        </p>
      </div>
    </Card>
  );
};

export default CustomerTrendCompassChart;

