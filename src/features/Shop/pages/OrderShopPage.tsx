import React from "react";
import Page from "@/foundation/components/layout/Page";
import Sidebar from "@/features/Shop/components/manager/Sidebar";
import OrderShop from "@/features/Shop/components/manager/OrderShop";

const OrderShopPage: React.FC = () => {
  return (
    <Page>
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <OrderShop />
          </div>
        </div>
      </div>
    </Page>
  );
};

export default OrderShopPage;

