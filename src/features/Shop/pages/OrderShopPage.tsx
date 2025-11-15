import React from "react";
import ShopManagerLayout from "@/features/Shop/components/layouts/ShopManagerLayout";
import { OrderShop } from "@/features/Shop/components/orders";

const OrderShopPage: React.FC = () => {
  return (
    <ShopManagerLayout>
      <OrderShop />
    </ShopManagerLayout>
  );
};

export default OrderShopPage;


