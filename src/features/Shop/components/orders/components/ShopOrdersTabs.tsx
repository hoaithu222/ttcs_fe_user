import type { LucideIcon } from "lucide-react";

export interface ShopOrdersTab {
  value: string;
  label: string;
  icon: LucideIcon;
  count: number;
}

interface ShopOrdersTabsProps {
  tabs: ShopOrdersTab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ShopOrdersTabs = ({ tabs, activeTab, onTabChange }: ShopOrdersTabsProps) => {
  return (
    <div className="flex flex-wrap gap-2 border-b border-border-2 pb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              isActive
                ? "border-primary-6 bg-primary-6 text-white shadow-[0_8px_20px_rgba(49,117,193,0.35)]"
                : "border-border-2 bg-background-2 text-neutral-7 hover:border-primary-4 hover:bg-primary-1 hover:text-neutral-9"
            }`}
          >
            <span
              className={`flex items-center justify-center rounded-full bg-white/10 p-1 ${
                isActive ? "text-white" : "text-primary-6"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`text-xs ${
                  isActive ? "text-white/80" : "rounded-full bg-neutral-1 px-2 py-0.5 text-neutral-6"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ShopOrdersTabs;


