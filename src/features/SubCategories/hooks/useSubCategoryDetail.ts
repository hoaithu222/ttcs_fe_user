import { useEffect, useMemo, useState } from "react";
import { ReduxStateType } from "@/app/store/types";
import type { SubCategory } from "@/core/api/categories/type";
import type { Product } from "@/core/api/products/type";
import { userSubCategoriesApi } from "@/core/api/sub-categories";
import { userCategoriesApi } from "@/core/api/categories";
import { userProductsApi } from "@/core/api/products";

export const useSubCategoryDetail = (subCategoryId?: string) => {
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [subCategoryStatus, setSubCategoryStatus] = useState(ReduxStateType.INIT);

  const [relatedSubCategories, setRelatedSubCategories] = useState<SubCategory[]>([]);
  const [relatedStatus, setRelatedStatus] = useState(ReduxStateType.INIT);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsStatus, setProductsStatus] = useState(ReduxStateType.INIT);

  useEffect(() => {
    if (!subCategoryId) return;

    let active = true;
    setSubCategoryStatus(ReduxStateType.LOADING);

    userSubCategoriesApi
      .getSubCategory(subCategoryId)
      .then((response) => {
        if (!active) return;
        setSubCategory(response.data ?? null);
        setSubCategoryStatus(ReduxStateType.SUCCESS);
      })
      .catch(() => {
        if (!active) return;
        setSubCategory(null);
        setSubCategoryStatus(ReduxStateType.ERROR);
      });

    return () => {
      active = false;
    };
  }, [subCategoryId]);

  const relatedCategoryId = useMemo(() => {
    if (!subCategory) return undefined;
    return subCategory.parentCategory?._id || subCategory._id;
  }, [subCategory]);

  useEffect(() => {
    if (!subCategoryId || !relatedCategoryId) return;

    let active = true;
    setRelatedStatus(ReduxStateType.LOADING);

    userCategoriesApi
      .getSubCategories(relatedCategoryId, { page: 1, limit: 16 })
      .then((response) => {
        if (!active) return;
        const items = Array.isArray(response.data)
          ? response.data
          : response.data?.subCategories || [];
        const filtered = items.filter((item) => item._id !== subCategoryId);
        setRelatedSubCategories(filtered);
        setRelatedStatus(ReduxStateType.SUCCESS);
      })
      .catch(() => {
        if (!active) return;
        setRelatedSubCategories([]);
        setRelatedStatus(ReduxStateType.ERROR);
      });

    return () => {
      active = false;
    };
  }, [subCategoryId, relatedCategoryId]);

  useEffect(() => {
    if (!subCategoryId) return;

    let active = true;
    setProductsStatus(ReduxStateType.LOADING);

    userProductsApi
      .getProducts({
        subCategoryId,
        page: 1,
        limit: 12,
      })
      .then((response) => {
        if (!active) return;
        const payload = response.data;
        const items = Array.isArray(payload) ? payload : payload?.products || [];
        setProducts(items);
        setProductsStatus(ReduxStateType.SUCCESS);
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
        setProductsStatus(ReduxStateType.ERROR);
      });

    return () => {
      active = false;
    };
  }, [subCategoryId]);

  return {
    subCategory,
    isLoadingSubCategory: subCategoryStatus === ReduxStateType.LOADING,
    relatedSubCategories,
    isLoadingRelatedSubCategories: relatedStatus === ReduxStateType.LOADING,
    products,
    isLoadingProducts: productsStatus === ReduxStateType.LOADING,
  };
};


