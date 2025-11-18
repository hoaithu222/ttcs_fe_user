import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { getPaymentMethodsStart } from "../slice/payment.slice";
import {
  selectPaymentMethods,
  selectIsPaymentMethodsLoading,
  selectPaymentMethodsError,
} from "../slice/payment.selector";

export const usePaymentMethods = () => {
  const dispatch = useAppDispatch();

  const paymentMethods = useAppSelector(selectPaymentMethods);
  const isLoading = useAppSelector(selectIsPaymentMethodsLoading);
  const error = useAppSelector(selectPaymentMethodsError);

  const fetchPaymentMethods = useCallback(() => {
    dispatch(getPaymentMethodsStart());
  }, [dispatch]);

  useEffect(() => {
    if (paymentMethods.length === 0 && !isLoading) {
      fetchPaymentMethods();
    }
  }, [paymentMethods.length, isLoading, fetchPaymentMethods]);

  return {
    paymentMethods,
    isLoading,
    error,
    fetchPaymentMethods,
  };
};

