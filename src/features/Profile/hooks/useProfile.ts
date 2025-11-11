import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { useInfoAccount } from "./useInfoAccount";
import { useProfileOrders } from "./useOrder";
import { useProfileAddresses } from "./useAddress";
import { selectCartList, selectCartStatus, selectCartPagination } from "../slice/profile.selector";
import { fetchCartStart } from "../slice/profile.slice";

export { useInfoAccount, useProfileOrders, useProfileAddresses };

// Backward-compatible alias
export const useProfile = useInfoAccount;

export function useProfileCart() {
  const dispatch = useAppDispatch();
  const carts = useAppSelector(selectCartList);
  const status = useAppSelector(selectCartStatus);
  const pagination = useAppSelector(selectCartPagination);

  const loadCart = useCallback(
    (page?: number, limit?: number) => {
      dispatch(fetchCartStart({ page, limit }));
    },
    [dispatch]
  );

  return { carts, status, pagination, loadCart };
}
