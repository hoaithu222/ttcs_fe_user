import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  selectAddresses,
  selectAddressesStatus,
  selectAddressesPagination,
  selectDefaultAddress,
} from "../slice/profile.selector";
import {
  fetchAddressesStart,
  createAddressStart,
  updateAddressStart,
  deleteAddressStart,
  setDefaultAddressStart,
} from "../slice/profile.slice";
import type { CreateAddressRequest, UpdateAddressRequest } from "@/core/api/addresses/type";

export function useProfileAddresses() {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(selectAddresses);
  const status = useAppSelector(selectAddressesStatus);
  const pagination = useAppSelector(selectAddressesPagination);
  const defaultAddress = useAppSelector(selectDefaultAddress);

  const loadAddresses = useCallback(() => {
    dispatch(fetchAddressesStart());
  }, [dispatch]);

  const createAddress = useCallback(
    (data: CreateAddressRequest) => {
      dispatch(createAddressStart(data));
    },
    [dispatch]
  );

  const updateAddress = useCallback(
    (id: string, data: UpdateAddressRequest) => {
      dispatch(updateAddressStart({ id, data }));
    },
    [dispatch]
  );

  const deleteAddress = useCallback(
    (id: string) => {
      dispatch(deleteAddressStart({ id }));
    },
    [dispatch]
  );

  const setDefaultAddress = useCallback(
    (id: string) => {
      dispatch(setDefaultAddressStart({ id }));
    },
    [dispatch]
  );

  return {
    addresses,
    status,
    pagination,
    defaultAddress,
    loadAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
}
