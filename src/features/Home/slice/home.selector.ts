import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";

const homeState = (state: RootState) => state.home;

// Banner selectors
export const selectBanner = createSelector([homeState], (home) => home.home_banner.data);
export const selectBannerStatus = createSelector([homeState], (home) => home.home_banner.status);
export const selectBannerError = createSelector([homeState], (home) => home.home_banner.error);

// Categories selectors
export const selectHomeCategories = createSelector([homeState], (home) => home.home_category.data);
export const selectHomeCategoriesStatus = createSelector(
  [homeState],
  (home) => home.home_category.status
);
export const selectHomeCategoriesError = createSelector(
  [homeState],
  (home) => home.home_category.error
);
export const selectHomeCategoriesPagination = createSelector(
  [homeState],
  (home) => home.home_category.pagination
);

// Best Seller Products selectors
export const selectBestSellerProducts = createSelector(
  [homeState],
  (home) => home.home_product_best_seller.data
);
export const selectBestSellerProductsStatus = createSelector(
  [homeState],
  (home) => home.home_product_best_seller.status
);
export const selectBestSellerProductsError = createSelector(
  [homeState],
  (home) => home.home_product_best_seller.error
);
export const selectBestSellerProductsPagination = createSelector(
  [homeState],
  (home) => home.home_product_best_seller.pagination
);

// Best Shops selectors
export const selectBestShops = createSelector([homeState], (home) => home.home_shop.data);
export const selectBestShopsStatus = createSelector([homeState], (home) => home.home_shop.status);
export const selectBestShopsError = createSelector([homeState], (home) => home.home_shop.error);
export const selectBestShopsPagination = createSelector(
  [homeState],
  (home) => home.home_shop.pagination
);

// Flash Sale Products selectors
export const selectFlashSaleProducts = createSelector(
  [homeState],
  (home) => home.home_product_flash_sale.data
);
export const selectFlashSaleProductsStatus = createSelector(
  [homeState],
  (home) => home.home_product_flash_sale.status
);
export const selectFlashSaleProductsError = createSelector(
  [homeState],
  (home) => home.home_product_flash_sale.error
);
export const selectFlashSaleProductsPagination = createSelector(
  [homeState],
  (home) => home.home_product_flash_sale.pagination
);

// Search Suggestion selectors
export const selectSearchSuggestionProducts = createSelector(
  [homeState],
  (home) => home.home_product_search_suggestion.data.products
);
export const selectSearchSuggestionStatus = createSelector(
  [homeState],
  (home) => home.home_product_search_suggestion.status
);
export const selectSearchSuggestionError = createSelector(
  [homeState],
  (home) => home.home_product_search_suggestion.error
);
export const selectSearchSuggestionPagination = createSelector(
  [homeState],
  (home) => home.home_product_search_suggestion.pagination
);
