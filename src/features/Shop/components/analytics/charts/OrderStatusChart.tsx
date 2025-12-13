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
import { Package } from "lucide-react";
import { OrderStatusData, OrderStatus } from "./types";

interface OrderStatusChartProps {
  data: OrderStatusData[];
}

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="p-3 bg-white border rounded-lg shadow-lg border-border-1">
          <p className="mb-1 text-sm font-semibold text-neutral-9">
            {data.payload.status}
          </p>
          <p className="text-sm text-primary-6">
            <span className="font-medium">Số lượng:</span> {data.value} đơn
          </p>
          <p className="text-xs text-neutral-6">
            {((data.value / data.payload.total) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Add total to each data point for tooltip calculation
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getStatusDisplayName = (status: string) => {
    const statusMap: Record<string, string> = {
      [OrderStatus.PENDING]: "Chờ xác nhận",
      [OrderStatus.CONFIRMED]: "Đã xác nhận",
      [OrderStatus.PROCESSING]: "Đang xử lý",
      [OrderStatus.SHIPPED]: "Đang giao",
      [OrderStatus.DELIVERED]: "Hoàn thành",
      [OrderStatus.CANCELLED]: "Đã hủy",
      [OrderStatus.RETURNED]: "Hoàn trả",
    };
    return statusMap[status] || status;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-9">
            Tỷ lệ Trạng thái Đơn hàng
          </h3>
          <p className="text-sm text-neutral-6">Phân bố trạng thái đơn hàng</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            innerRadius={60}
            fill="#8884d8"
            dataKey="count"
          >
            {dataWithTotal.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color }}>
                {getStatusDisplayName(entry.payload.status)}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-3 mt-6 md:grid-cols-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <div className="flex-1">
              <p className="text-xs font-medium text-neutral-9">
                {getStatusDisplayName(item.status)}
              </p>
              <p className="text-sm font-bold text-neutral-9">{item.count}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default OrderStatusChart;