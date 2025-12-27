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
  Cell,
} from "recharts";
import { Card } from "@/foundation/components/info/Card";
import { AlertTriangle } from "lucide-react";
import Empty from "@/foundation/components/empty/Empty";

interface CancellationDataPoint {
  period: string;
  notReceived: number; // Khách không nhận hàng
  damaged: number; // Hàng lỗi/vỡ
  shopCancelled: number; // Shop hủy (hết hàng)
  totalFailed: number;
  totalOrders: number;
  complaintRate: number; // Tỷ lệ % khiếu nại
}

interface OrderCancellationChartProps {
  data: CancellationDataPoint[] | null;
  isLoading?: boolean;
}

const OrderCancellationChart: React.FC<OrderCancellationChartProps> = ({
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
        <Empty variant="data" title="Chưa có dữ liệu" description="Chưa có dữ liệu hủy đơn" />
      </Card>
    );
  }

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-primary-6" />
          <h3 className="text-lg font-semibold text-neutral-9">
            Tỷ lệ hoàn/Hủy đơn & Lý do
          </h3>
        </div>
        <p className="text-sm text-neutral-6">
          Phân tích đơn hàng thất bại và lý do để cải thiện chất lượng
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="period"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            label={{ value: "Số đơn hàng", angle: -90, position: "insideLeft" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: "Tỷ lệ %", angle: 90, position: "insideRight" }}
            domain={[0, 100]}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                notReceived: "Khách không nhận hàng",
                damaged: "Hàng lỗi/vỡ",
                shopCancelled: "Shop hủy (hết hàng)",
                totalFailed: "Tổng đơn thất bại",
                complaintRate: "Tỷ lệ khiếu nại (%)",
              };
              if (name === "complaintRate") {
                return [formatPercent(value), labels[name] || name];
              }
              return [value, labels[name] || name];
            }}
          />
          <Legend
            formatter={(value: string) => {
              const labels: Record<string, string> = {
                notReceived: "Khách không nhận hàng",
                damaged: "Hàng lỗi/vỡ",
                shopCancelled: "Shop hủy (hết hàng)",
                complaintRate: "Tỷ lệ khiếu nại (%)",
              };
              return labels[value] || value;
            }}
          />
          <Bar yAxisId="left" dataKey="notReceived" stackId="a" fill="#f59e0b" name="notReceived">
            {data.map((entry, index) => (
              <Cell key={`cell-notReceived-${index}`} fill="#f59e0b" />
            ))}
          </Bar>
          <Bar yAxisId="left" dataKey="damaged" stackId="a" fill="#f97316" name="damaged">
            {data.map((entry, index) => (
              <Cell key={`cell-damaged-${index}`} fill="#f97316" />
            ))}
          </Bar>
          <Bar yAxisId="left" dataKey="shopCancelled" stackId="a" fill="#ef4444" name="shopCancelled">
            {data.map((entry, index) => (
              <Cell key={`cell-shopCancelled-${index}`} fill="#ef4444" />
            ))}
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="complaintRate"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: "#8b5cf6", r: 4 }}
            name="complaintRate"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 text-xs text-neutral-6">
        <p>
          * Cột chồng: Tổng đơn hàng thất bại (Vàng: Không nhận, Cam: Hàng lỗi, Đỏ: Shop hủy) |
          Đường tím: Tỷ lệ % khiếu nại trên tổng đơn
        </p>
      </div>
    </Card>
  );
};

export default OrderCancellationChart;

