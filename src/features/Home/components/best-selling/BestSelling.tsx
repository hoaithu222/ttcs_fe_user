import React from "react";
import { useBestSelling } from "../../hooks/useBestSelling";
import CardProduct from "../card-product/CardProduct";
import Spinner from "@/foundation/components/feedback/Spinner";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";

const BestSelling: React.FC = () => {
  const { products, isLoading } = useBestSelling(1, 12);

  if (isLoading) {
    return (
      <Section>
        <SectionTitle>Sản phẩm bán chạy</SectionTitle>
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      </Section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionTitle>Sản phẩm bán chạy</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {products.map((product) => (
          <CardProduct key={product._id} product={product} />
        ))}
      </div>
    </Section>
  );
};

export default BestSelling;
