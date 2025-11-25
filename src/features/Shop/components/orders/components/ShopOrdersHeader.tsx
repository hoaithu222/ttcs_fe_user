import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import { Package } from "lucide-react";

interface ShopOrdersHeaderProps {
  totalOrders: number;
  pendingOrders: number;
}

const ShopOrdersHeader = ({ totalOrders, pendingOrders }: ShopOrdersHeaderProps) => {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-border-2 bg-background-1 p-4 shadow-sm">
      <IconCircleWrapper size="lg" color="info">
        <Package className="h-6 w-6 text-info" />
      </IconCircleWrapper>
      <div className="flex-1 min-w-[220px]">
        <h1 className="text-xl font-semibold text-neutral-9">Quản lý đơn hàng</h1>
        <p className="text-sm text-neutral-6">Theo dõi và xử lý quy trình fulfillment cho shop</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-6">
          <span>
            Tổng đơn: <span className="font-semibold text-neutral-9">{totalOrders}</span>
          </span>
          <span>
            Chờ xử lý: <span className="font-semibold text-warning">{pendingOrders}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShopOrdersHeader;


