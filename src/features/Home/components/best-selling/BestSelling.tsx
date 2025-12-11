import React from "react";
import { Crown } from "lucide-react";
import { useBestSelling } from "../../hooks/useBestSelling";
import CardProduct from "../card-product/CardProduct";
import Spinner from "@/foundation/components/feedback/Spinner";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import { Product } from "@/core/api/products/type";

const BestSelling: React.FC = () => {
  const { products, isLoading } = useBestSelling(1, 12);

  if (isLoading) {
    return (
      <Section className="py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-2 text-primary-7">
              Top seller
            </span>
            <SectionTitle className="text-xl font-bold text-neutral-9">
              Sản phẩm bán chạy
            </SectionTitle>
          </div>
        </div>
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
    <Section className="py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary-1 via-primary-2 to-transparent border border-primary-2/70 shadow-md">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary-6 text-white shadow">
            <Crown className="w-4 h-4" />
            Top seller
          </span>
          <div className="flex flex-col">
            <SectionTitle className="text-xl md:text-2xl font-bold text-neutral-9">
              Sản phẩm bán chạy
            </SectionTitle>
            <span className="text-xs text-primary-7 font-semibold">
              Lượt mua cao trong tuần
            </span>
          </div>
        </div>
        <span className="text-sm text-primary-7 font-semibold">
          {products.length} sản phẩm được mua nhiều
        </span>
      </div>

      <div className="grid grid-cols-2 mb-6 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product: Product) => (
          <CardProduct key={product._id} product={product} />
        ))}
      </div>
    </Section>
  );
};

export default BestSelling;
