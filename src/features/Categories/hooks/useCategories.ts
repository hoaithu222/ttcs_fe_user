import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  fetchCategoriesStart,
  fetchCategoryDetailStart,
  fetchSubCategoriesStart,
  fetchCategoryProductsStart,
  resetCurrentCategory,
} from "../slice/categories.slice";
import {
  selectCategories,
  selectCategoriesStatus,
  selectCategoriesError,
  selectCategoriesPagination,
  selectCurrentCategory,
  selectCurrentCategoryStatus,
  selectCurrentCategoryError,
  selectSubCategories,
  selectSubCategoriesStatus,
  selectSubCategoriesError,
  selectSubCategoriesPagination,
  selectCategoryProducts,
  selectCategoryProductsStatus,
  selectCategoryProductsError,
  selectCategoryProductsPagination,
} from "../slice/categories.selector";

export const useCategories = () => {
  const dispatch = useAppDispatch();

  const categories = useAppSelector(selectCategories);
  const categoriesStatus = useAppSelector(selectCategoriesStatus);
  const categoriesError = useAppSelector(selectCategoriesError);
  const categoriesPagination = useAppSelector(selectCategoriesPagination);

  const fetchCategories = (params?: { page?: number; limit?: number; isActive?: boolean }) => {
    dispatch(fetchCategoriesStart(params || {}));
  };

  return {
    categories,
    categoriesStatus,
    categoriesError,
    categoriesPagination,
    fetchCategories,
  };
};

export const useCategoryDetail = (categoryId?: string) => {
  const dispatch = useAppDispatch();

  const currentCategory = useAppSelector(selectCurrentCategory);
  const currentCategoryStatus = useAppSelector(selectCurrentCategoryStatus);
  const currentCategoryError = useAppSelector(selectCurrentCategoryError);

  const subCategories = useAppSelector(selectSubCategories);
  const subCategoriesStatus = useAppSelector(selectSubCategoriesStatus);
  const subCategoriesError = useAppSelector(selectSubCategoriesError);
  const subCategoriesPagination = useAppSelector(selectSubCategoriesPagination);

  const categoryProducts = useAppSelector(selectCategoryProducts);
  const categoryProductsStatus = useAppSelector(selectCategoryProductsStatus);
  const categoryProductsError = useAppSelector(selectCategoryProductsError);
  const categoryProductsPagination = useAppSelector(selectCategoryProductsPagination);

  const fetchCategoryDetail = (id: string) => {
    dispatch(fetchCategoryDetailStart({ id }));
  };

  const fetchSubCategories = (id: string, params?: { page?: number; limit?: number }) => {
    dispatch(fetchSubCategoriesStart({ categoryId: id, ...params }));
  };

  const fetchCategoryProducts = (id: string, params?: { page?: number; limit?: number }) => {
    dispatch(fetchCategoryProductsStart({ categoryId: id, ...params }));
  };

  const resetCategory = () => {
    dispatch(resetCurrentCategory());
  };

  useEffect(() => {
    if (categoryId) {
      fetchCategoryDetail(categoryId);
      fetchSubCategories(categoryId);
      fetchCategoryProducts(categoryId);
    }
  }, [categoryId]);

  return {
    currentCategory,
    currentCategoryStatus,
    currentCategoryError,
    subCategories,
    subCategoriesStatus,
    subCategoriesError,
    subCategoriesPagination,
    categoryProducts,
    categoryProductsStatus,
    categoryProductsError,
    categoryProductsPagination,
    fetchCategoryDetail,
    fetchSubCategories,
    fetchCategoryProducts,
    resetCategory,
  };
};
