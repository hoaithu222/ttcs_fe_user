import React from "react";
import { Flame } from "lucide-react";
import { useFlashSale } from "../../hooks/useFalshSale";
import CardProduct from "../card-product/CardProduct";
import Spinner from "@/foundation/components/feedback/Spinner";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import { Product } from "@/core/api/products/type";

const FlashSale: React.FC = () => {
  const { products, isLoading } = useFlashSale(1, 12);

  if (isLoading) {
    return (
      <Section className="py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-error/10 text-error">
              Flash Sale
            </span>
            <SectionTitle className="text-xl font-bold text-neutral-9">
              Săn deal đang diễn ra
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
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5 px-4 py-3 rounded-md bg-gradient-to-r from-error/60 via-error/80 to-transparent border border-error/20 shadow-md">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-error text-white shadow">
            <Flame className="w-4 h-4" />
            Flash Sale
          </span>
          <div className="flex flex-col">
            <SectionTitle className="text-xl md:text-2xl font-bold text-neutral-9">
              Săn deal giá tốt
            </SectionTitle>
            <span className="text-xs text-error font-semibold">
              Giảm sốc trong thời gian ngắn
            </span>
          </div>
        </div>
        <span className="text-sm text-error font-semibold">
          {products.length} sản phẩm đang giảm
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product: Product) => (
          <CardProduct key={product._id} product={product} />
        ))}
      </div>
    </Section>
  );
};

export default FlashSale;

