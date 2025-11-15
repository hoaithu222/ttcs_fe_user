import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxStateType } from "@/app/store/types";
import type { Product, ProductReview, ProductListQuery } from "@/core/api/products/type";
import type { Shop } from "@/core/api/shops/type";
import type { InitProductState } from "./product.type";

const initialState: InitProductState = {
  products: {
    data: [],
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  currentProductId: null,
  productDetail: {
    data: null,
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  relatedProducts: {
    data: [],
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  reviews: {
    data: [],
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  shop: {
    data: null,
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    // Get products list
    getProductsStart: (state, _action: PayloadAction<ProductListQuery | undefined>) => {
      state.products.status = ReduxStateType.LOADING;
      state.products.error = null;
      state.products.message = null;
    },
    getProductsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.products.status = ReduxStateType.SUCCESS;
      state.products.data = action.payload;
      state.products.error = null;
      state.products.message = null;
    },
    getProductsFailure: (state, action: PayloadAction<string>) => {
      state.products.status = ReduxStateType.ERROR;
      state.products.error = action.payload;
      state.products.message = action.payload;
    },

    // Get product detail
    getProductDetailStart: (state, action: PayloadAction<string>) => {
      state.currentProductId = action.payload;
      state.productDetail.status = ReduxStateType.LOADING;
      state.productDetail.error = null;
      state.productDetail.message = null;
    },
    getProductDetailSuccess: (state, action: PayloadAction<Product>) => {
      state.productDetail.status = ReduxStateType.SUCCESS;
      state.productDetail.data = action.payload;
      state.productDetail.error = null;
      state.productDetail.message = null;
    },
    getProductDetailFailure: (state, action: PayloadAction<string>) => {
      state.productDetail.status = ReduxStateType.ERROR;
      state.productDetail.error = action.payload;
      state.productDetail.message = action.payload;
    },

    // Get related products
    getRelatedProductsStart: (state, _action: PayloadAction<string>) => {
      state.relatedProducts.status = ReduxStateType.LOADING;
      state.relatedProducts.error = null;
      state.relatedProducts.message = null;
    },
    getRelatedProductsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.relatedProducts.status = ReduxStateType.SUCCESS;
      state.relatedProducts.data = action.payload;
      state.relatedProducts.error = null;
      state.relatedProducts.message = null;
    },
    getRelatedProductsFailure: (state, action: PayloadAction<string>) => {
      state.relatedProducts.status = ReduxStateType.ERROR;
      state.relatedProducts.error = action.payload;
      state.relatedProducts.message = action.payload;
    },

    // Get product reviews
    getProductReviewsStart: (
      state,
      _action: PayloadAction<{ productId: string; page?: number; limit?: number }>
    ) => {
      state.reviews.status = ReduxStateType.LOADING;
      state.reviews.error = null;
      state.reviews.message = null;
    },
    getProductReviewsSuccess: (state, action: PayloadAction<ProductReview[]>) => {
      state.reviews.status = ReduxStateType.SUCCESS;
      state.reviews.data = action.payload;
      state.reviews.error = null;
      state.reviews.message = null;
    },
    getProductReviewsFailure: (state, action: PayloadAction<string>) => {
      state.reviews.status = ReduxStateType.ERROR;
      state.reviews.error = action.payload;
      state.reviews.message = action.payload;
    },

    // Get shop info
    getProductShopStart: (state, _action: PayloadAction<string>) => {
      state.shop.status = ReduxStateType.LOADING;
      state.shop.error = null;
      state.shop.message = null;
    },
    getProductShopSuccess: (state, action: PayloadAction<Shop>) => {
      state.shop.status = ReduxStateType.SUCCESS;
      state.shop.data = action.payload;
      state.shop.error = null;
      state.shop.message = null;
    },
    getProductShopFailure: (state, action: PayloadAction<string>) => {
      state.shop.status = ReduxStateType.ERROR;
      state.shop.error = action.payload;
      state.shop.message = action.payload;
    },

    // Clear product detail
    clearProductDetail: (state) => {
      state.productDetail.data = null;
      state.productDetail.status = ReduxStateType.INIT;
      state.productDetail.error = null;
      state.productDetail.message = null;
      state.currentProductId = null;
    },
  },
});

export const {
  getProductsStart,
  getProductsSuccess,
  getProductsFailure,
  getProductDetailStart,
  getProductDetailSuccess,
  getProductDetailFailure,
  getRelatedProductsStart,
  getRelatedProductsSuccess,
  getRelatedProductsFailure,
  getProductReviewsStart,
  getProductReviewsSuccess,
  getProductReviewsFailure,
  getProductShopStart,
  getProductShopSuccess,
  getProductShopFailure,
  clearProductDetail,
} = productSlice.actions;

export default productSlice.reducer;
