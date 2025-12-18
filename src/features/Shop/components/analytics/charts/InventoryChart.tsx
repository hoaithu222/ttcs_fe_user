import React from "react";
import { Card } from "@/foundation/components/info/Card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Package, AlertTriangle, XCircle } from "lucide-react";
import Empty from "@/foundation/components/empty/Empty";

interface InventoryChartProps {
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  productsCount: number;
}

const InventoryChart: React.FC<InventoryChartProps> = ({
  totalStock,
  lowStockCount,
  outOfStockCount,
  productsCount,
}) => {
  const inStockCount = productsCount - outOfStockCount - lowStockCount;

  const data = [
    {
      name: "Tồn kho tốt",
      value: inStockCount,
      color: "#10b981",
    },
    {
      name: "Sắp hết hàng",
      value: lowStockCount,
      color: "#f59e0b",
    },
    {
      name: "Hết hàng",
      value: outOfStockCount,
      color: "#ef4444",
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / productsCount) * 100).toFixed(1);
      return (
        <div className="p-3 bg-white border rounded-lg shadow-lg border-border-1">
          <p className="mb-1 text-sm font-semibold text-neutral-9">{data.name}</p>
          <p className="text-sm text-neutral-6">
            Số lượng: <span className="font-semibold text-primary-6">{data.value}</span>
          </p>
          <p className="text-sm text-neutral-6">
            Tỷ lệ: <span className="font-semibold text-primary-6">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Hide label for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-brand to-brand/80 text-white">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-9">Thống kê tồn kho</h3>
          <p className="text-sm text-neutral-6">Tổng tồn kho: {totalStock.toLocaleString("vi-VN")}</p>
        </div>
      </div>

      {productsCount === 0 ? (
        <Empty 
          variant="data" 
          size="small" 
          title="Chưa có sản phẩm" 
          description="Đăng bán sản phẩm để xem báo cáo tồn kho" 
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => {
                  const item = data.find((d) => d.name === value);
                  return (
                    <span className="text-sm" style={{ color: item?.color }}>
                      {value}
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/20 text-success">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-6">Tồn kho tốt</p>
                <p className="text-xl font-bold text-neutral-9">{inStockCount} sản phẩm</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/20 text-warning">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-6">Sắp hết hàng (≤10)</p>
                <p className="text-xl font-bold text-neutral-9">{lowStockCount} sản phẩm</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-error/10 border border-error/20">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-error/20 text-error">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-6">Hết hàng</p>
                <p className="text-xl font-bold text-neutral-9">{outOfStockCount} sản phẩm</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default InventoryChart;



