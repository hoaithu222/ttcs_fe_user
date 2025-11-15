import React from "react";
import ShopManagerLayout from "@/features/Shop/components/layouts/ShopManagerLayout";
import { InfoShop } from "@/features/Shop/components/shop-info";

const ShopInfoPage: React.FC = () => {
  return (
    <ShopManagerLayout>
      <InfoShop />
    </ShopManagerLayout>
  );
};

export default ShopInfoPage;

