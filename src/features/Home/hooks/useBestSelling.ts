import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  fetchBestSellerProductsStart,
  selectBestSellerProducts,
  selectBestSellerProductsStatus,
  selectBestSellerProductsError,
} from "../slice";

export const useBestSelling = (page = 1, limit = 10) => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectBestSellerProducts);
  const status = useAppSelector(selectBestSellerProductsStatus);
  const error = useAppSelector(selectBestSellerProductsError);

  useEffect(() => {
    dispatch(fetchBestSellerProductsStart({ page, limit }));
  }, [dispatch, page, limit]);

  return {
    products,
    isLoading: status === "LOADING",
    error,
  };
};
