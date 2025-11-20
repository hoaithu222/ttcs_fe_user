import React from "react";
import { useFlashSale } from "../../hooks/useFalshSale";
import CardProduct from "../card-product/CardProduct";
import Spinner from "@/foundation/components/feedback/Spinner";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";

const FlashSale: React.FC = () => {
  const { products, isLoading } = useFlashSale(1, 12);

  if (isLoading) {
    return (
      <Section>
        <SectionTitle>Flash Sale</SectionTitle>
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
    <Section className="py-6">
      <SectionTitle className="text-center mb-4 text-2xl font-bold text-primary-6">Flash Sale</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <CardProduct key={product._id} product={product} />
        ))}
      </div>
    </Section>
  );
};

export default FlashSale;

