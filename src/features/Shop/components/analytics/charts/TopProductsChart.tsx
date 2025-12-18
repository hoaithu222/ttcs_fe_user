import React from "react";
import { Card } from "@/foundation/components/info/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Trophy } from "lucide-react";
import Empty from "@/foundation/components/empty/Empty";

interface TopProduct {
  _id: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

interface TopProductsChartProps {
  products: TopProduct[];
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ products }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = products.slice(0, 10).map((product) => ({
    name: product.productName.length > 20
      ? `${product.productName.substring(0, 20)}...`
      : product.productName,
    fullName: product.productName,
    sold: product.totalSold,
    revenue: product.totalRevenue,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border rounded-lg shadow-lg border-border-1">
          <p className="mb-2 text-sm font-semibold text-neutral-9">
            {payload[0].payload.fullName}
          </p>
          <p className="text-sm text-primary-6">
            <span className="font-medium">Đã bán:</span> {payload[0].value} sản phẩm
          </p>
          <p className="text-sm text-success">
            <span className="font-medium">Doanh thu:</span> {formatCurrency(payload[1]?.value || 0)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-warning to-warning/80 text-white">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-9">Sản phẩm bán chạy</h3>
          <p className="text-sm text-neutral-6">Top {products.length} sản phẩm</p>
        </div>
      </div>
      
      {products.length === 0 ? (
        <Empty 
          variant="data" 
          size="small" 
          title="Chưa có dữ liệu sản phẩm" 
          description="Bán sản phẩm đầu tiên để xem thống kê tại đây" 
        />
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" style={{ fontSize: "12px" }} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              width={150}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => {
                if (value === "sold") return "Số lượng bán";
                if (value === "revenue") return "Doanh thu";
                return value;
              }}
            />
            <Bar
              dataKey="sold"
              fill="#3b82f6"
              radius={[0, 8, 8, 0]}
              name="sold"
            />
            <Bar
              dataKey="revenue"
              fill="#10b981"
              radius={[0, 8, 8, 0]}
              name="revenue"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default TopProductsChart;



