import { combineReducers } from "@reduxjs/toolkit";
import languageReducer from "./slices/language";
import themeReducer from "./slices/theme";
import authReducer from "@/features/Auth/components/slice/auth.slice";
import { toastReducer } from "./slices/toast";
import homeReducer from "@/features/Home/slice/home.slice";
import profileReducer from "@/features/Profile/slice/profile.slice";
import shopReducer from "@/features/Shop/slice/shop.slice";
import { categoriesReducer } from "@/features/Categories/slice";
import productReducer from "@/features/Products/slices/product.slice";
import cartReducer from "@/features/Cart/slice/Cart.slice";
import { AppReducerType } from "./types";

export const rootReducer = combineReducers({
  [AppReducerType.LANGUAGE]: languageReducer,
  [AppReducerType.THEME]: themeReducer,
  [AppReducerType.AUTH]: authReducer,
  [AppReducerType.TOAST]: toastReducer,
  home: homeReducer,
  profile: profileReducer,
  shop: shopReducer,
  categories: categoriesReducer,
  product: productReducer,
  cart: cartReducer,
});
