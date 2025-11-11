import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HomeState } from "./home.types";
import { Category } from "@/core/api/categories/type";
import { Product } from "@/core/api/products/type";
import { Shop } from "@/core/api/shops/type";
import { ReduxStateType } from "@/app/store/types";

const initialState: HomeState = {
  home_banner: {
    data: null,
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  home_category: {
    data: [],
    status: ReduxStateType.INIT,
    error: null,
    message: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
  home_product_best_seller: {
    data: [],
    status: ReduxStateType.INIT,
    error: null,
    message: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
  home_shop: {
    data: [],
    status: ReduxStateType.INIT,
    error: null,
    message: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
  home_product_flash_sale: {
    data: [],
    status: ReduxStateType.INIT,
    error: null,
    message: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
  home_product_search_suggestion: {
    data: {
      products: [],
    },
    status: ReduxStateType.INIT,
    error: null,
    message: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    // Banner actions
    fetchBannerStart: (state) => {
      state.home_banner.status = ReduxStateType.LOADING;
      state.home_banner.error = null;
      state.home_banner.message = null;
    },
    fetchBannerSuccess: (state, action: PayloadAction<any>) => {
      state.home_banner.status = ReduxStateType.SUCCESS;
      state.home_banner.data = action.payload;
      state.home_banner.error = null;
      state.home_banner.message = null;
    },
    fetchBannerFailure: (state, action: PayloadAction<string>) => {
      state.home_banner.status = ReduxStateType.ERROR;
      state.home_banner.error = action.payload;
      state.home_banner.message = action.payload;
      state.home_banner.data = null;
    },

    // Category actions
    fetchHomeCategoriesStart: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
      state.home_category.status = ReduxStateType.LOADING;
      state.home_category.error = null;
      state.home_category.message = null;
      if (action.payload.page) state.home_category.pagination.page = action.payload.page;
      if (action.payload.limit) state.home_category.pagination.limit = action.payload.limit;
    },
    fetchHomeCategoriesSuccess: (
      state,
      action: PayloadAction<{ categories: Category[]; pagination: any }>
    ) => {
      state.home_category.status = ReduxStateType.SUCCESS;
      state.home_category.data = action.payload.categories;
      state.home_category.pagination = action.payload.pagination;
      state.home_category.error = null;
      state.home_category.message = null;
    },
    fetchHomeCategoriesFailure: (state, action: PayloadAction<string>) => {
      state.home_category.status = ReduxStateType.ERROR;
      state.home_category.error = action.payload;
      state.home_category.message = action.payload;
      state.home_category.data = [];
    },

    // Best Seller Products actions
    fetchBestSellerProductsStart: (
      state,
      action: PayloadAction<{ page?: number; limit?: number }>
    ) => {
      state.home_product_best_seller.status = ReduxStateType.LOADING;
      state.home_product_best_seller.error = null;
      state.home_product_best_seller.message = null;
      if (action.payload.page) state.home_product_best_seller.pagination.page = action.payload.page;
      if (action.payload.limit)
        state.home_product_best_seller.pagination.limit = action.payload.limit;
    },
    fetchBestSellerProductsSuccess: (
      state,
      action: PayloadAction<{ products: Product[]; pagination: any }>
    ) => {
      state.home_product_best_seller.status = ReduxStateType.SUCCESS;
      state.home_product_best_seller.data = action.payload.products;
      state.home_product_best_seller.pagination = action.payload.pagination;
      state.home_product_best_seller.error = null;
      state.home_product_best_seller.message = null;
    },
    fetchBestSellerProductsFailure: (state, action: PayloadAction<string>) => {
      state.home_product_best_seller.status = ReduxStateType.ERROR;
      state.home_product_best_seller.error = action.payload;
      state.home_product_best_seller.message = action.payload;
      state.home_product_best_seller.data = [];
    },

    // Best Shop actions
    fetchBestShopsStart: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
      state.home_shop.status = ReduxStateType.LOADING;
      state.home_shop.error = null;
      state.home_shop.message = null;
      if (action.payload.page) state.home_shop.pagination.page = action.payload.page;
      if (action.payload.limit) state.home_shop.pagination.limit = action.payload.limit;
    },
    fetchBestShopsSuccess: (state, action: PayloadAction<{ shops: Shop[]; pagination: any }>) => {
      state.home_shop.status = ReduxStateType.SUCCESS;
      state.home_shop.data = action.payload.shops;
      state.home_shop.pagination = action.payload.pagination;
      state.home_shop.error = null;
      state.home_shop.message = null;
    },
    fetchBestShopsFailure: (state, action: PayloadAction<string>) => {
      state.home_shop.status = ReduxStateType.ERROR;
      state.home_shop.error = action.payload;
      state.home_shop.message = action.payload;
      state.home_shop.data = [];
    },

    // Flash Sale Products actions
    fetchFlashSaleProductsStart: (
      state,
      action: PayloadAction<{ page?: number; limit?: number }>
    ) => {
      state.home_product_flash_sale.status = ReduxStateType.LOADING;
      state.home_product_flash_sale.error = null;
      state.home_product_flash_sale.message = null;
      if (action.payload.page) state.home_product_flash_sale.pagination.page = action.payload.page;
      if (action.payload.limit)
        state.home_product_flash_sale.pagination.limit = action.payload.limit;
    },
    fetchFlashSaleProductsSuccess: (
      state,
      action: PayloadAction<{ products: Product[]; pagination: any }>
    ) => {
      state.home_product_flash_sale.status = ReduxStateType.SUCCESS;
      state.home_product_flash_sale.data = action.payload.products;
      state.home_product_flash_sale.pagination = action.payload.pagination;
      state.home_product_flash_sale.error = null;
      state.home_product_flash_sale.message = null;
    },
    fetchFlashSaleProductsFailure: (state, action: PayloadAction<string>) => {
      state.home_product_flash_sale.status = ReduxStateType.ERROR;
      state.home_product_flash_sale.error = action.payload;
      state.home_product_flash_sale.message = action.payload;
      state.home_product_flash_sale.data = [];
    },

    // Search Suggestion actions
    fetchSearchSuggestionStart: (
      state,
      action: PayloadAction<{ query: string; page?: number; limit?: number }>
    ) => {
      state.home_product_search_suggestion.status = ReduxStateType.LOADING;
      state.home_product_search_suggestion.error = null;
      state.home_product_search_suggestion.message = null;
      if (action.payload.page)
        state.home_product_search_suggestion.pagination.page = action.payload.page;
      if (action.payload.limit)
        state.home_product_search_suggestion.pagination.limit = action.payload.limit;
    },
    fetchSearchSuggestionSuccess: (
      state,
      action: PayloadAction<{ products: Product[]; pagination: any }>
    ) => {
      state.home_product_search_suggestion.status = ReduxStateType.SUCCESS;
      state.home_product_search_suggestion.data.products = action.payload.products;
      state.home_product_search_suggestion.pagination = action.payload.pagination;
      state.home_product_search_suggestion.error = null;
      state.home_product_search_suggestion.message = null;
    },
    fetchSearchSuggestionFailure: (state, action: PayloadAction<string>) => {
      state.home_product_search_suggestion.status = ReduxStateType.ERROR;
      state.home_product_search_suggestion.error = action.payload;
      state.home_product_search_suggestion.message = action.payload;
      state.home_product_search_suggestion.data.products = [];
    },

    // Reset actions
    resetHomeState: () => {
      return initialState;
    },
  },
});

export const {
  fetchBannerStart,
  fetchBannerSuccess,
  fetchBannerFailure,
  fetchHomeCategoriesStart,
  fetchHomeCategoriesSuccess,
  fetchHomeCategoriesFailure,
  fetchBestSellerProductsStart,
  fetchBestSellerProductsSuccess,
  fetchBestSellerProductsFailure,
  fetchBestShopsStart,
  fetchBestShopsSuccess,
  fetchBestShopsFailure,
  fetchFlashSaleProductsStart,
  fetchFlashSaleProductsSuccess,
  fetchFlashSaleProductsFailure,
  fetchSearchSuggestionStart,
  fetchSearchSuggestionSuccess,
  fetchSearchSuggestionFailure,
  resetHomeState,
} = homeSlice.actions;

export default homeSlice.reducer;
