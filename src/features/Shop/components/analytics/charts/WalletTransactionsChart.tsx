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
import { Wallet } from "lucide-react";
import { WalletTransactionData } from "./types";
import Empty from "@/foundation/components/empty/Empty";

interface WalletTransactionsChartProps {
  data: WalletTransactionData[];
}

const WalletTransactionsChart: React.FC<WalletTransactionsChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    return `T${month}/${year.slice(2)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const income = payload.find((p: any) => p.dataKey === "income")?.value || 0;
      const expense = payload.find((p: any) => p.dataKey === "expense")?.value || 0;
      const net = income - expense;

      return (
        <div className="p-3 bg-white border rounded-lg shadow-lg border-border-1">
          <p className="mb-2 text-sm font-semibold text-neutral-9">
            {formatMonth(label)}
          </p>
          <p className="text-sm text-success">
            <span className="font-medium">Tiền vào:</span> {formatCurrency(income)}
          </p>
          <p className="text-sm text-red-500">
            <span className="font-medium">Tiền ra:</span> {formatCurrency(expense)}
          </p>
          <p className={`text-sm font-medium ${net >= 0 ? "text-success" : "text-red-500"}`}>
            <span className="font-medium">Lãi/Lỗ:</span> {formatCurrency(net)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-700 text-white">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-9">
            Dòng tiền Ví điện tử
          </h3>
          <p className="text-sm text-neutral-6">Tiền vào vs Tiền ra theo tháng</p>
        </div>
      </div>
      
      {!data || data.length === 0 ? (
        <Empty 
          variant="data" 
          size="small" 
          title="Chưa có giao dịch ví" 
          description="Lịch sử dòng tiền ví sẽ được thống kê tại đây" 
        />
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
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
                if (value === "income") return "Tiền vào";
                if (value === "expense") return "Tiền ra";
                return value;
              }}
            />
            <Bar
              dataKey="income"
              stackId="a"
              fill="#10b981"
              stroke="#10b981"
              strokeWidth={1}
              name="income"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="expense"
              stackId="a"
              fill="#ef4444"
              stroke="#ef4444"
              strokeWidth={1}
              name="expense"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default WalletTransactionsChart;