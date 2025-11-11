import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  selectOrders,
  selectOrdersStatus,
  selectOrdersPagination,
} from "../slice/profile.selector";
import { fetchOrdersStart } from "../slice/profile.slice";

export function useProfileOrders() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const status = useAppSelector(selectOrdersStatus);
  const pagination = useAppSelector(selectOrdersPagination);

  const loadOrders = useCallback(
    (page?: number, limit?: number) => {
      dispatch(fetchOrdersStart({ page, limit }));
    },
    [dispatch]
  );

  return { orders, status, pagination, loadOrders };
}
