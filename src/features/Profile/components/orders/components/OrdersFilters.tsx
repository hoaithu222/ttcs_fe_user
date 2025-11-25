import { useMemo } from "react";

import * as Form from "@radix-ui/react-form";
import {
  BadgeCheck,
  CheckCircle2,
  MailCheck,
  Package,
  RefreshCcw,
  ShoppingBag,
  WalletCards,
} from "lucide-react";

import Button from "@/foundation/components/buttons/Button";
import DatePicker from "@/foundation/components/input/DatePicker";
import Input from "@/foundation/components/input/Input";

export type OrdersTabKey =
  | "all"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "awaiting_payment";

interface OrdersFiltersProps {
  tabs: Array<{ key: OrdersTabKey; label: string }>;
  activeTab: OrdersTabKey;
  countsByTab: Record<string, number>;
  onTabChange: (tab: OrdersTabKey) => void;
  filters: {
    searchCode: string;
    dateFrom: Date | null;
    dateTo: Date | null;
  };
  onFiltersChange: (partial: Partial<OrdersFiltersProps["filters"]>) => void;
  onResetFilters: () => void;
}

const OrdersFilters = ({
  tabs,
  activeTab,
  countsByTab,
  onTabChange,
  filters,
  onFiltersChange,
  onResetFilters,
}: OrdersFiltersProps) => {
  const hasFilter = useMemo(
    () => Boolean(filters.searchCode || filters.dateFrom || filters.dateTo),
    [filters]
  );

  const tabIconMap: Record<OrdersTabKey, JSX.Element> = {
    all: <RefreshCcw className="h-4 w-4" />,
    awaiting_payment: <WalletCards className="h-4 w-4" />,
    pending: <MailCheck className="h-4 w-4" />,
    processing: <Package className="h-4 w-4" />,
    shipped: <ShoppingBag className="h-4 w-4" />,
    delivered: <CheckCircle2 className="h-4 w-4" />,
    cancelled: <BadgeCheck className="h-4 w-4 rotate-45" />,
  };

  return (
    <Form.Root
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="flex flex-row flex-wrap gap-2 border-b border-border-2 pb-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = countsByTab[tab.key] || 0;
          const hasCount = count > 0;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-4 ${
                isActive
                  ? "border-primary-6 bg-primary-6 text-neutral-0 shadow-[0_8px_20px_rgba(49,117,193,0.35)]"
                  : "border-border-2 bg-background-2 text-neutral-7 hover:border-primary-3 hover:bg-primary-1 hover:text-neutral-9"
              }`}
              aria-pressed={isActive}
              type="button"
            >
              <span
                className={`flex items-center justify-center rounded-full bg-white/10 p-1 ${
                  isActive ? "text-neutral-0" : "text-primary-6"
                }`}
              >
                {tabIconMap[tab.key]}
              </span>
              <span>{tab.label}</span>
              {hasCount && <span className="ml-1 text-xs opacity-80">({count})</span>}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border-2 bg-background-2 p-3 md:flex-row md:items-end">
        <div className="flex-1">
          <Input
            name="order-search"
            placeholder="Tìm theo mã đơn hoặc ID"
            value={filters.searchCode}
            onChange={(event) => onFiltersChange({ searchCode: event.target.value })}
            inputCustomClass="pl-10"
            iconLeft={<span className="text-neutral-5">#</span>}
          />
        </div>
        <div className="flex flex-1 flex-col gap-3 md:flex-row">
          <DatePicker
            value={filters.dateFrom}
            onChange={(date) => onFiltersChange({ dateFrom: date })}
            placeholder="Từ ngày"
            allowTextInput
            className="w-full"
          />
          <DatePicker
            value={filters.dateTo}
            onChange={(date) => onFiltersChange({ dateTo: date })}
            placeholder="Đến ngày"
            allowTextInput
            className="w-full"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasFilter}
          onClick={onResetFilters}
          className="shrink-0"
        >
          Xóa lọc
        </Button>
      </div>
    </Form.Root>
  );
};

export default OrdersFilters;


