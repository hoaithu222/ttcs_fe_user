import React from "react";
import { Navigate, useParams } from "react-router-dom";
import Page from "@/foundation/components/layout/Page";
import CategoryBanner from "@/features/Categories/components/CategoryBanner";
import SubCategoryList from "@/features/Categories/components/SubCategoryList";
import ProductGrid from "@/features/Categories/components/ProductGrid";
import { useSubCategoryDetail } from "./hooks/useSubCategoryDetail";

const SubCategoryPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const {
    subCategory,
    isLoadingSubCategory,
    relatedSubCategories,
    isLoadingRelatedSubCategories,
    products,
    isLoadingProducts,
  } = useSubCategoryDetail(id);

  if (!id) {
    return <Navigate to="/categories" replace />;
  }

  return (
    <Page>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <CategoryBanner category={subCategory} isLoading={isLoadingSubCategory} />

        {relatedSubCategories && relatedSubCategories.length > 0 && (
          <SubCategoryList
            subCategories={relatedSubCategories}
            isLoading={isLoadingRelatedSubCategories}
            title="Danh mục liên quan"
          />
        )}

        <ProductGrid
          products={products}
          isLoading={isLoadingProducts}
          title={subCategory ? `Sản phẩm thuộc ${subCategory.name}` : "Sản phẩm theo danh mục con"}
        />
      </div>
    </Page>
  );
};

export default SubCategoryPage;


