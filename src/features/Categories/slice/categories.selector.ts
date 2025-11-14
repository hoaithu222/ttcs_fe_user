import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";

const categoriesState = (state: RootState) => state.categories;

// Categories list selectors
export const selectCategories = createSelector([categoriesState], (categories) => categories.categories.data);
export const selectCategoriesStatus = createSelector(
  [categoriesState],
  (categories) => categories.categories.status
);
export const selectCategoriesError = createSelector(
  [categoriesState],
  (categories) => categories.categories.error
);
export const selectCategoriesPagination = createSelector(
  [categoriesState],
  (categories) => categories.categories.pagination
);

// Current category selectors
export const selectCurrentCategory = createSelector(
  [categoriesState],
  (categories) => categories.currentCategory.data
);
export const selectCurrentCategoryStatus = createSelector(
  [categoriesState],
  (categories) => categories.currentCategory.status
);
export const selectCurrentCategoryError = createSelector(
  [categoriesState],
  (categories) => categories.currentCategory.error
);

// Subcategories selectors
export const selectSubCategories = createSelector(
  [categoriesState],
  (categories) => categories.subCategories.data
);
export const selectSubCategoriesStatus = createSelector(
  [categoriesState],
  (categories) => categories.subCategories.status
);
export const selectSubCategoriesError = createSelector(
  [categoriesState],
  (categories) => categories.subCategories.error
);
export const selectSubCategoriesPagination = createSelector(
  [categoriesState],
  (categories) => categories.subCategories.pagination
);

// Category products selectors
export const selectCategoryProducts = createSelector(
  [categoriesState],
  (categories) => categories.categoryProducts.data
);
export const selectCategoryProductsStatus = createSelector(
  [categoriesState],
  (categories) => categories.categoryProducts.status
);
export const selectCategoryProductsError = createSelector(
  [categoriesState],
  (categories) => categories.categoryProducts.error
);
export const selectCategoryProductsPagination = createSelector(
  [categoriesState],
  (categories) => categories.categoryProducts.pagination
);

