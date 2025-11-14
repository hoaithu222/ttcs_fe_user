import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Page from "@/foundation/components/layout/Page";
import { useCategories, useCategoryDetail } from "./hooks/useCategories";
import CategoryBanner from "./components/CategoryBanner";
import CategoryList from "./components/CategoryList";
import SubCategoryList from "./components/SubCategoryList";
import ProductGrid from "./components/ProductGrid";
import { ReduxStateType } from "@/app/store/types";

const CategoriesPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { categories, categoriesStatus, fetchCategories } = useCategories();
  const {
    currentCategory,
    currentCategoryStatus,
    subCategories,
    subCategoriesStatus,
    categoryProducts,
    categoryProductsStatus,
  } = useCategoryDetail(id);

  // Fetch all categories on mount if no specific category ID
  useEffect(() => {
    if (!id) {
      fetchCategories({ page: 1, limit: 20, isActive: true });
    }
  }, [id]);

  const isLoadingCategories = categoriesStatus === ReduxStateType.LOADING;
  const isLoadingCategoryDetail = currentCategoryStatus === ReduxStateType.LOADING;
  const isLoadingSubCategories = subCategoriesStatus === ReduxStateType.LOADING;
  const isLoadingProducts = categoryProductsStatus === ReduxStateType.LOADING;

  // If viewing a specific category
  if (id) {
    return (
      <Page>
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Banner */}
          <CategoryBanner category={currentCategory} isLoading={isLoadingCategoryDetail} />

          {/* Subcategories */}
          {subCategories && subCategories.length > 0 && (
            <SubCategoryList
              subCategories={subCategories}
              isLoading={isLoadingSubCategories}
              title="Danh mục con"
            />
          )}

          {/* Products */}
          <ProductGrid
            products={categoryProducts}
            isLoading={isLoadingProducts}
            title={currentCategory ? `Sản phẩm ${currentCategory.name}` : "Sản phẩm"}
          />
        </div>
      </Page>
    );
  }

  // If viewing all categories
  return (
    <Page>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <CategoryList
          categories={categories}
          isLoading={isLoadingCategories}
          title="Tất cả danh mục"
        />
      </div>
    </Page>
  );
};

export default CategoriesPage;
