import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  fetchHomeCategoriesStart,
  selectHomeCategories,
  selectHomeCategoriesStatus,
  selectHomeCategoriesError,
  selectHomeCategoriesPagination,
} from "../slice";

export const useCategoryHome = (page = 1, limit = 10) => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectHomeCategories);
  const status = useAppSelector(selectHomeCategoriesStatus);
  const error = useAppSelector(selectHomeCategoriesError);
  const pagination = useAppSelector(selectHomeCategoriesPagination);

  useEffect(() => {
    dispatch(fetchHomeCategoriesStart({ page, limit }));
  }, [dispatch, page, limit]);

  return {
    categories,
    pagination,
    isLoading: status === "LOADING",
    error,
  };
};
