import React from "react";
import ShopManagerLayout from "@/features/Shop/components/layouts/ShopManagerLayout";
import { ListProduct } from "@/features/Shop/components/products/ProductList";

const ListProductPage: React.FC = () => {
  return (
    <ShopManagerLayout>
      <ListProduct />
    </ShopManagerLayout>
  );
};

export default ListProductPage;


