import React from "react";
import { Card } from "@/foundation/components/info/Card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { RevenueData } from "./types";
import Empty from "@/foundation/components/empty/Empty";

interface RevenueProfitChartProps {
  data: RevenueData[];
}

const RevenueProfitChart: React.FC<RevenueProfitChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border rounded-lg shadow-lg border-border-1">
          <p className="mb-2 text-sm font-semibold text-neutral-9">
            Ngày {formatDate(label)}
          </p>
          <p className="text-sm text-primary-6">
            <span className="font-medium">Doanh thu:</span> {formatCurrency(payload[0]?.value || 0)}
          </p>
          <p className="text-sm text-success">
            <span className="font-medium">Lợi nhuận:</span> {formatCurrency(payload[1]?.value || 0)}
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
            Doanh thu & Lợi nhuận
          </h3>
          <p className="text-sm text-neutral-6">Xu hướng dòng tiền theo ngày</p>
        </div>
      </div>
      
      {!data || data.length === 0 ? (
        <Empty 
          variant="data" 
          size="small" 
          title="Chưa có dữ liệu lợi nhuận" 
          description="Lợi nhuận sẽ được thống kê dựa trên đơn hàng hoàn tất" 
        />
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => {
                if (value === "revenue") return "Doanh thu";
                if (value === "profit") return "Lợi nhuận";
                return value;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stackId="1"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
              name="revenue"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stackId="2"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorProfit)"
              strokeWidth={2}
              name="profit"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default RevenueProfitChart;