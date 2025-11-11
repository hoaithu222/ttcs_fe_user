import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";

const profileState = (state: RootState) => (state as unknown as any).profile;

// Profile
export const selectProfile = createSelector([profileState], (s) => s.profile.data);
export const selectProfileStatus = createSelector([profileState], (s) => s.profile.status);
export const selectProfileError = createSelector([profileState], (s) => s.profile.error);

// Cart
export const selectCartList = createSelector([profileState], (s) => s.cart.data);
export const selectCartStatus = createSelector([profileState], (s) => s.cart.status);
export const selectCartError = createSelector([profileState], (s) => s.cart.error);
export const selectCartPagination = createSelector([profileState], (s) => s.cart.pagination);

// Orders
export const selectOrders = createSelector([profileState], (s) => s.orders.data);
export const selectOrdersStatus = createSelector([profileState], (s) => s.orders.status);
export const selectOrdersError = createSelector([profileState], (s) => s.orders.error);
export const selectOrdersPagination = createSelector([profileState], (s) => s.orders.pagination);

// Addresses
export const selectAddresses = createSelector([profileState], (s) => s.address.data);
export const selectAddressesStatus = createSelector([profileState], (s) => s.address.status);
export const selectAddressesError = createSelector([profileState], (s) => s.address.error);
export const selectAddressesPagination = createSelector(
  [profileState],
  (s) => s.address.pagination
);
export const selectDefaultAddress = createSelector([profileState], (s) => s.address.defaultAddress);

// Address CRUD sub-statuses
export const selectCreateAddressStatus = createSelector(
  [profileState],
  (s) => s.address.createAddress.status
);
export const selectCreateAddressError = createSelector(
  [profileState],
  (s) => s.address.createAddress.error
);
export const selectUpdateAddressStatus = createSelector(
  [profileState],
  (s) => s.address.updateAddress.status
);
export const selectUpdateAddressError = createSelector(
  [profileState],
  (s) => s.address.updateAddress.error
);
export const selectDeleteAddressStatus = createSelector(
  [profileState],
  (s) => s.address.deleteAddress.status
);
export const selectDeleteAddressError = createSelector(
  [profileState],
  (s) => s.address.deleteAddress.error
);
