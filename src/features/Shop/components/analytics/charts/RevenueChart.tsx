import React from "react";
import { Card } from "@/foundation/components/info/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface RevenueChartProps {
  data: Array<{
    date?: string;
    month?: string;
    revenue: number;
    orders: number;
  }>;
  type?: "day" | "month";
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, type = "day" }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (type === "month") {
      const [year, month] = dateStr.split("-");
      return `T${month}/${year.slice(2)}`;
    }
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border rounded-lg shadow-lg border-border-1">
          <p className="mb-2 text-sm font-semibold text-neutral-9">
            {type === "month" ? payload[0].payload.month : payload[0].payload.date}
          </p>
          <p className="text-sm text-primary-6">
            <span className="font-medium">Doanh thu:</span> {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-success">
            <span className="font-medium">Đơn hàng:</span> {payload[1]?.value || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-6 to-primary-8 text-white">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-9">
            Doanh thu {type === "month" ? "theo tháng" : "theo ngày"}
          </h3>
          <p className="text-sm text-neutral-6">Xu hướng doanh thu và đơn hàng</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={type === "month" ? "month" : "date"}
            tickFormatter={formatDate}
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            yAxisId="revenue"
            orientation="left"
            tickFormatter={formatCurrency}
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            stroke="#10b981"
            style={{ fontSize: "12px" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
            formatter={(value) => {
              if (value === "revenue") return "Doanh thu";
              if (value === "orders") return "Đơn hàng";
              return value;
            }}
          />
          <Line
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
            name="revenue"
          />
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="orders"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
            name="orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default RevenueChart;

