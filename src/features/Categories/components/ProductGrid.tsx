import React from "react";
import { Product } from "@/core/api/products/type";
import CardProduct from "@/features/Home/components/card-product/CardProduct";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  title?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  title = "Sản phẩm",
}) => {
  if (isLoading) {
    return (
      <Section>
        <SectionTitle>{title}</SectionTitle>
        <div className="flex justify-center items-center py-12">
          <Loading variant="spinner" />
        </div>
      </Section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Section>
        <SectionTitle>{title}</SectionTitle>
        <Empty
          variant="data"
          title="Chưa có sản phẩm"
          description="Sản phẩm sẽ được hiển thị ở đây"
        />
      </Section>
    );
  }

  return (
    <Section className="py-8">
      <SectionTitle>{title}</SectionTitle>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 ">
        {products.map((product) => (
          <CardProduct key={product._id} product={product} />
        ))}
      </div>
    </Section>
  );
};

export default ProductGrid;
