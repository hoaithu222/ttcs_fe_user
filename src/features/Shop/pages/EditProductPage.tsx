import React from "react";
import ShopManagerLayout from "@/features/Shop/components/layouts/ShopManagerLayout";
import { EditProduct } from "@/features/Shop/components/products/ProductForm";

const EditProductPage: React.FC = () => {
  return (
    <ShopManagerLayout>
      <EditProduct />
    </ShopManagerLayout>
  );
};

export default EditProductPage;

