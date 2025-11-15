import React from "react";
import ShopManagerLayout from "@/features/Shop/components/layouts/ShopManagerLayout";
import { AddProduct } from "@/features/Shop/components/products/ProductForm";

const AddProductPage: React.FC = () => {
  return (
    <ShopManagerLayout>
      <AddProduct />
    </ShopManagerLayout>
  );
};

export default AddProductPage;
