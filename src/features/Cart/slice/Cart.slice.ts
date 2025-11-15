import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initDataCart } from "./Cart.type";
import { ReduxStateType } from "@/app/store/types";
import { Cart } from "@/core/api/cart/type";

const initialState: initDataCart = {
  my_cart: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
    cart: {} as Cart,
  },
  add_to_cart: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
    cart: {} as Cart,
  },
  delete_from_cart: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
    cart: {} as Cart,
  },
  update_quantity: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
    cart: {} as Cart,
  },
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Get Cart
    getCartStart: (state) => {
      state.my_cart.status = ReduxStateType.LOADING;
      state.my_cart.error = null;
      state.my_cart.message = null;
    },
    getCartSuccess: (state, action: PayloadAction<Cart>) => {
      state.my_cart.status = ReduxStateType.SUCCESS;
      state.my_cart.cart = action.payload;
      state.my_cart.error = null;
    },
    getCartFailure: (state, action: PayloadAction<string>) => {
      state.my_cart.status = ReduxStateType.ERROR;
      state.my_cart.error = action.payload;
    },

    // Add to Cart
    addToCartStart: (state, _action: PayloadAction<any>) => {
      state.add_to_cart.status = ReduxStateType.LOADING;
      state.add_to_cart.error = null;
      state.add_to_cart.message = null;
    },
    addToCartSuccess: (state, action: PayloadAction<Cart>) => {
      state.add_to_cart.status = ReduxStateType.SUCCESS;
      state.add_to_cart.cart = action.payload;
      state.my_cart.cart = action.payload; // Update main cart
      state.add_to_cart.error = null;
    },
    addToCartFailure: (state, action: PayloadAction<string>) => {
      state.add_to_cart.status = ReduxStateType.ERROR;
      state.add_to_cart.error = action.payload;
    },

    // Remove from Cart
    removeFromCartStart: (state, _action: PayloadAction<string>) => {
      state.delete_from_cart.status = ReduxStateType.LOADING;
      state.delete_from_cart.error = null;
      state.delete_from_cart.message = null;
    },
    removeFromCartSuccess: (state, action: PayloadAction<Cart>) => {
      state.delete_from_cart.status = ReduxStateType.SUCCESS;
      state.delete_from_cart.cart = action.payload;
      state.my_cart.cart = action.payload; // Update main cart
      state.delete_from_cart.error = null;
    },
    removeFromCartFailure: (state, action: PayloadAction<string>) => {
      state.delete_from_cart.status = ReduxStateType.ERROR;
      state.delete_from_cart.error = action.payload;
    },

    // Update Quantity
    updateQuantityStart: (state, _action: PayloadAction<{ itemId: string; quantity: number }>) => {
      state.update_quantity.status = ReduxStateType.LOADING;
      state.update_quantity.error = null;
      state.update_quantity.message = null;
    },
    updateQuantitySuccess: (state, action: PayloadAction<Cart>) => {
      state.update_quantity.status = ReduxStateType.SUCCESS;
      state.update_quantity.cart = action.payload;
      state.my_cart.cart = action.payload; // Update main cart
      state.update_quantity.error = null;
    },
    updateQuantityFailure: (state, action: PayloadAction<string>) => {
      state.update_quantity.status = ReduxStateType.ERROR;
      state.update_quantity.error = action.payload;
    },

    // Clear Cart
    clearCartStart: (state) => {
      state.my_cart.status = ReduxStateType.LOADING;
      state.my_cart.error = null;
    },
    clearCartSuccess: (state, action: PayloadAction<Cart>) => {
      state.my_cart.status = ReduxStateType.SUCCESS;
      state.my_cart.cart = action.payload;
      state.my_cart.error = null;
    },
    clearCartFailure: (state, action: PayloadAction<string>) => {
      state.my_cart.status = ReduxStateType.ERROR;
      state.my_cart.error = action.payload;
    },
  },
});

export const {
  getCartStart,
  getCartSuccess,
  getCartFailure,
  addToCartStart,
  addToCartSuccess,
  addToCartFailure,
  removeFromCartStart,
  removeFromCartSuccess,
  removeFromCartFailure,
  updateQuantityStart,
  updateQuantitySuccess,
  updateQuantityFailure,
  clearCartStart,
  clearCartSuccess,
  clearCartFailure,
} = cartSlice.actions;

export default cartSlice.reducer;
