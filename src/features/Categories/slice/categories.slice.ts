import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CategoriesState } from "./categories.types";
import { Category, SubCategory } from "@/core/api/categories/type";
import { Product } from "@/core/api/products/type";
import { ReduxStateType } from "@/app/store/types";

const initialState: CategoriesState = {
  categories: {
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
  currentCategory: {
    data: null,
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  subCategories: {
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
  categoryProducts: {
    data: [],
    status: ReduxStateType.INIT,
    error: null,
    message: null,
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    },
  },
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    // Categories list actions
    fetchCategoriesStart: (state, action: PayloadAction<{ page?: number; limit?: number; isActive?: boolean }>) => {
      state.categories.status = ReduxStateType.LOADING;
      state.categories.error = null;
      state.categories.message = null;
      if (action.payload.page) state.categories.pagination.page = action.payload.page;
      if (action.payload.limit) state.categories.pagination.limit = action.payload.limit;
    },
    fetchCategoriesSuccess: (
      state,
      action: PayloadAction<{ categories: Category[]; pagination: any }>
    ) => {
      state.categories.status = ReduxStateType.SUCCESS;
      state.categories.data = action.payload.categories;
      state.categories.pagination = action.payload.pagination;
      state.categories.error = null;
      state.categories.message = null;
    },
    fetchCategoriesFailure: (state, action: PayloadAction<string>) => {
      state.categories.status = ReduxStateType.ERROR;
      state.categories.error = action.payload;
      state.categories.message = action.payload;
      state.categories.data = [];
    },

    // Current category actions
    fetchCategoryDetailStart: (state, action: PayloadAction<{ id: string }>) => {
      state.currentCategory.status = ReduxStateType.LOADING;
      state.currentCategory.error = null;
      state.currentCategory.message = null;
    },
    fetchCategoryDetailSuccess: (state, action: PayloadAction<Category>) => {
      state.currentCategory.status = ReduxStateType.SUCCESS;
      state.currentCategory.data = action.payload;
      state.currentCategory.error = null;
      state.currentCategory.message = null;
    },
    fetchCategoryDetailFailure: (state, action: PayloadAction<string>) => {
      state.currentCategory.status = ReduxStateType.ERROR;
      state.currentCategory.error = action.payload;
      state.currentCategory.message = action.payload;
      state.currentCategory.data = null;
    },

    // Subcategories actions
    fetchSubCategoriesStart: (
      state,
      action: PayloadAction<{ categoryId: string; page?: number; limit?: number }>
    ) => {
      state.subCategories.status = ReduxStateType.LOADING;
      state.subCategories.error = null;
      state.subCategories.message = null;
      if (action.payload.page) state.subCategories.pagination.page = action.payload.page;
      if (action.payload.limit) state.subCategories.pagination.limit = action.payload.limit;
    },
    fetchSubCategoriesSuccess: (
      state,
      action: PayloadAction<{ subCategories: SubCategory[]; pagination: any }>
    ) => {
      state.subCategories.status = ReduxStateType.SUCCESS;
      state.subCategories.data = action.payload.subCategories;
      state.subCategories.pagination = action.payload.pagination;
      state.subCategories.error = null;
      state.subCategories.message = null;
    },
    fetchSubCategoriesFailure: (state, action: PayloadAction<string>) => {
      state.subCategories.status = ReduxStateType.ERROR;
      state.subCategories.error = action.payload;
      state.subCategories.message = action.payload;
      state.subCategories.data = [];
    },

    // Category products actions
    fetchCategoryProductsStart: (
      state,
      action: PayloadAction<{ categoryId: string; page?: number; limit?: number }>
    ) => {
      state.categoryProducts.status = ReduxStateType.LOADING;
      state.categoryProducts.error = null;
      state.categoryProducts.message = null;
      if (action.payload.page) state.categoryProducts.pagination.page = action.payload.page;
      if (action.payload.limit) state.categoryProducts.pagination.limit = action.payload.limit;
    },
    fetchCategoryProductsSuccess: (
      state,
      action: PayloadAction<{ products: Product[]; pagination: any }>
    ) => {
      state.categoryProducts.status = ReduxStateType.SUCCESS;
      state.categoryProducts.data = action.payload.products;
      state.categoryProducts.pagination = action.payload.pagination;
      state.categoryProducts.error = null;
      state.categoryProducts.message = null;
    },
    fetchCategoryProductsFailure: (state, action: PayloadAction<string>) => {
      state.categoryProducts.status = ReduxStateType.ERROR;
      state.categoryProducts.error = action.payload;
      state.categoryProducts.message = action.payload;
      state.categoryProducts.data = [];
    },

    // Reset actions
    resetCategoriesState: () => {
      return initialState;
    },
    resetCurrentCategory: (state) => {
      state.currentCategory = initialState.currentCategory;
      state.subCategories = initialState.subCategories;
      state.categoryProducts = initialState.categoryProducts;
    },
  },
});

export const {
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchCategoryDetailStart,
  fetchCategoryDetailSuccess,
  fetchCategoryDetailFailure,
  fetchSubCategoriesStart,
  fetchSubCategoriesSuccess,
  fetchSubCategoriesFailure,
  fetchCategoryProductsStart,
  fetchCategoryProductsSuccess,
  fetchCategoryProductsFailure,
  resetCategoriesState,
  resetCurrentCategory,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;

