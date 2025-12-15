import React from "react";
import { Card } from "@/foundation/components/info/Card";
import { Users, ShoppingBag, DollarSign, Calendar } from "lucide-react";

interface Customer {
  userId: string;
  userName: string;
  userEmail: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

interface CustomerChartProps {
  customers: Customer[];
}

const CustomerChart: React.FC<CustomerChartProps> = ({ customers }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-8 to-primary-6 text-white">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-9">Khách hàng thân thiết</h3>
          <p className="text-sm text-neutral-6">Top {customers.length} khách hàng</p>
        </div>
      </div>

      <div className="space-y-3">
        {customers.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-neutral-4" />
            <p className="text-sm text-neutral-6">Chưa có dữ liệu khách hàng</p>
          </div>
        ) : (
          customers.map((customer, index) => (
            <div
              key={customer.userId}
              className="flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md bg-background-1 border-border-1"
            >
              <div className="flex items-center justify-center w-12 h-12 font-bold text-white rounded-full bg-gradient-to-br from-primary-6 to-primary-8">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="mb-1 text-base font-semibold text-neutral-9 truncate">
                  {customer.userName}
                </h4>
                <p className="text-sm text-neutral-6 truncate">{customer.userEmail}</p>
              </div>
              <div className="flex gap-6 items-center">
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1 text-sm text-neutral-6">
                    <ShoppingBag className="w-4 h-4" />
                    <span className="font-semibold text-neutral-9">{customer.totalOrders}</span>
                    <span>đơn</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-6">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold text-primary-6">
                      {formatCurrency(customer.totalSpent)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-neutral-2 text-neutral-6">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(customer.lastOrderDate)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default CustomerChart;



