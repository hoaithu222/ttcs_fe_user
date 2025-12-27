import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/foundation/components/info/Card";
import { Clock } from "lucide-react";
import Empty from "@/foundation/components/empty/Empty";

interface ForecastDataPoint {
  hour: string;
  currentOrders: number;
  averageOrders: number;
}

interface OrderForecastChartProps {
  data: ForecastDataPoint[] | null;
  isLoading?: boolean;
}

const OrderForecastChart: React.FC<OrderForecastChartProps> = ({
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

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <Empty variant="data" title="Chưa có dữ liệu" description="Chưa có dữ liệu dự báo đơn hàng" />
      </Card>
    );
  }

  // Find peak hours
  const peakHours = data
    .filter((d) => d.currentOrders > d.averageOrders * 1.2)
    .map((d) => d.hour);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-primary-6" />
          <h3 className="text-lg font-semibold text-neutral-9">
            Dự báo đơn hàng & Hiệu suất vận hành
          </h3>
        </div>
        <p className="text-sm text-neutral-6">
          So sánh đơn hàng hiện tại với trung bình tuần trước để tìm "Giờ vàng"
        </p>
      </div>

      {/* Peak Hours Alert */}
      {peakHours.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm font-semibold text-blue-900">
            ⏰ Giờ vàng: {peakHours.join(", ")} - Khuyến nghị livestream hoặc Flash Sale
          </p>
        </div>
      )}

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="hour"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            label={{ value: "Số đơn hàng", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                currentOrders: "Đơn hàng hiện tại",
                averageOrders: "Trung bình tuần trước",
              };
              return [value, labels[name] || name];
            }}
          />
          <Legend
            formatter={(value: string) => {
              const labels: Record<string, string> = {
                currentOrders: "Đơn hàng hiện tại (Hôm nay)",
                averageOrders: "Trung bình tuần trước",
              };
              return labels[value] || value;
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="currentOrders"
            fill="#3b82f6"
            name="currentOrders"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="averageOrders"
            stroke="#a855f7"
            strokeWidth={2}
            dot={{ fill: "#a855f7", r: 4 }}
            name="averageOrders"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 text-xs text-neutral-6">
        <p>
          * Cột xanh dương: Số đơn hàng thực tế theo từng giờ trong ngày | Đường tím: Số đơn hàng
          trung bình của 1 tuần trước
        </p>
      </div>
    </Card>
  );
};

export default OrderForecastChart;

