import React from "react";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import { Product } from "@/core/api/products/type";

interface ContentProductProps {
  product: Product;
}

const ContentProduct: React.FC<ContentProductProps> = ({ product }) => {
  if (!product.description && !product.weight && !product.dimensions && !product.warrantyInfo) {
    return null;
  }

  return (
    <Section className="bg-background-2 rounded-2xl p-6 lg:p-8 shadow-sm border border-border-1">
      {product.description && (
        <div className="mb-8">
          <SectionTitle className="mb-4">Mô tả sản phẩm</SectionTitle>
          <div className="prose prose-sm lg:prose-base max-w-none">
            <div className="text-neutral-7 whitespace-pre-line leading-relaxed">
              {product.description}
            </div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      {(product.weight || product.dimensions || product.warrantyInfo) && (
        <div className={`${product.description ? "pt-6 border-t border-border-1" : ""}`}>
          <h4 className="mb-6 text-xl font-semibold text-neutral-9">Thông tin chi tiết</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.weight && (
              <div className="p-4 bg-background-1 rounded-lg border border-border-1">
                <span className="block text-xs text-neutral-6 mb-1">Trọng lượng</span>
                <span className="text-base font-semibold text-neutral-9">{product.weight} g</span>
              </div>
            )}
            {product.dimensions && (
              <div className="p-4 bg-background-1 rounded-lg border border-border-1">
                <span className="block text-xs text-neutral-6 mb-1">Kích thước</span>
                <span className="text-base font-semibold text-neutral-9">{product.dimensions}</span>
              </div>
            )}
            {product.warrantyInfo && (
              <div className="p-4 bg-background-1 rounded-lg border border-border-1">
                <span className="block text-xs text-neutral-6 mb-1">Bảo hành</span>
                <span className="text-base font-semibold text-neutral-9">
                  {product.warrantyInfo}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Section>
  );
};

export default ContentProduct;
