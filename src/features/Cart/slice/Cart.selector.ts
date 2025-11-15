import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import type { initDataCart } from "./Cart.type";
import { CartItem } from "@/core/api/cart/type";

const selectCartState = (state: RootState): initDataCart => state.cart;

// Cart selectors
export const selectCart = createSelector(selectCartState, (state) => state.my_cart.cart);
export const selectCartStatus = createSelector(selectCartState, (state) => state.my_cart.status);
export const selectCartError = createSelector(selectCartState, (state) => state.my_cart.error);

// Cart items selectors
export const selectCartItems = createSelector(selectCart, (cart) => {
  if (!cart) return [];
  return (cart.items || cart.cartItems || []) as CartItem[];
});

export const selectCartItemCount = createSelector(selectCartItems, (items) => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
});

export const selectCartSubtotal = createSelector(selectCartItems, (items) => {
  return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
});

export const selectCartTotal = createSelector(selectCart, (cart) => {
  if (!cart) return 0;
  return cart.totalAmount || cart.subtotal || 0;
});

export const selectCartShopCount = createSelector(selectCartItems, (items) => {
  const uniqueShops = new Set(items.map((item) => item.shopId));
  return uniqueShops.size;
});

// Add to cart selectors
export const selectAddToCartStatus = createSelector(
  selectCartState,
  (state) => state.add_to_cart.status
);
export const selectAddToCartError = createSelector(
  selectCartState,
  (state) => state.add_to_cart.error
);

// Remove from cart selectors
export const selectRemoveFromCartStatus = createSelector(
  selectCartState,
  (state) => state.delete_from_cart.status
);

// Update quantity selectors
export const selectUpdateQuantityStatus = createSelector(
  selectCartState,
  (state) => state.update_quantity.status
);

// Is cart loading
export const selectIsCartLoading = createSelector(selectCartStatus, (status) => {
  return status === "LOADING";
});

// Is cart empty
export const selectIsCartEmpty = createSelector(selectCartItems, (items) => {
  return !items || items.length === 0;
});
