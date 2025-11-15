import React from "react";
import Page from "@/foundation/components/layout/Page";
import Sidebar from "@/features/Shop/components/layouts/Sidebar";
import ScrollView from "@/foundation/components/scroll/ScrollView";

interface ShopManagerLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ShopManagerLayout
 *
 * Layout component chung cho các trang quản lý Shop.
 * Bao gồm Sidebar navigation và content area.
 *
 * Props:
 * - children: React.ReactNode — Nội dung chính của trang
 * - className?: string — CSS classes bổ sung cho container
 *
 * Usage:
 * ```tsx
 * <ShopManagerLayout>
 *   <YourContentComponent />
 * </ShopManagerLayout>
 * ```
 */
const ShopManagerLayout: React.FC<ShopManagerLayoutProps> = ({ children, className = "" }) => {
  return (
    <Page>
      <div className={` px-4  mx-auto ${className}`}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
          {/* Sidebar */}
          <div className="lg:col-span-2">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 min-h-[calc(100vh-70px)] max-h-[calc(100vh-70px)]">
            <ScrollView className="overflow-y-auto flex-1">
              <div className="mt-6">{children}</div>
            </ScrollView>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ShopManagerLayout;
