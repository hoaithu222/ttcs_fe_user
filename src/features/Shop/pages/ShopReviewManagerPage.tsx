import React from "react";
import ShopManagerLayout from "@/features/Shop/components/layouts/ShopManagerLayout";
import { ShopReview } from "@/features/Shop/components/shop-info";

const ShopReviewManagerPage: React.FC = () => {
  return (
    <ShopManagerLayout>
      <ShopReview />
    </ShopManagerLayout>
  );
};

export default ShopReviewManagerPage;


