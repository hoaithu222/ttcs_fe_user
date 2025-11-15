import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import type { InitProductState } from "./product.type";

const selectProductState = (state: RootState): InitProductState => state.product;

// Products list selectors
export const selectProducts = createSelector([selectProductState], (state) => state.products.data);

export const selectProductsStatus = createSelector(
  [selectProductState],
  (state) => state.products.status
);

export const selectProductsError = createSelector(
  [selectProductState],
  (state) => state.products.error
);

// Product detail selectors
export const selectProductDetail = createSelector(
  [selectProductState],
  (state) => state.productDetail.data
);

export const selectProductDetailStatus = createSelector(
  [selectProductState],
  (state) => state.productDetail.status
);

export const selectProductDetailError = createSelector(
  [selectProductState],
  (state) => state.productDetail.error
);

export const selectCurrentProductId = createSelector(
  [selectProductState],
  (state) => state.currentProductId
);

// Related products selectors
export const selectRelatedProducts = createSelector(
  [selectProductState],
  (state) => state.relatedProducts.data
);

export const selectRelatedProductsStatus = createSelector(
  [selectProductState],
  (state) => state.relatedProducts.status
);

// Reviews selectors
export const selectProductReviews = createSelector(
  [selectProductState],
  (state) => state.reviews.data
);

export const selectProductReviewsStatus = createSelector(
  [selectProductState],
  (state) => state.reviews.status
);

// Shop selectors
export const selectProductShop = createSelector([selectProductState], (state) => state.shop.data);

export const selectProductShopStatus = createSelector(
  [selectProductState],
  (state) => state.shop.status
);
