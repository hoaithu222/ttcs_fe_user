import { all } from "redux-saga/effects";
import { authSaga } from "@/features/Auth/components/slice/auth.saga";
import { homeSaga } from "@/features/Home/slice/home.saga";
import { profileSaga } from "@/features/Profile/slice/profile.saga";
import { shopSaga } from "@/features/Shop/slice/shop.saga";
import { categoriesSaga } from "@/features/Categories/slice/categories.saga";
import { productSaga } from "@/features/Products/slices/product.saga";
import { cartSaga } from "@/features/Cart/slice/Cart.saga";
import { paymentSaga } from "@/features/Payment/slice/payment.saga";
import { notificationSaga } from "./slices/notification/notification.saga";
import { chatSaga } from "./slices/chat/chat.saga";

export const rootSage = function* () {
  try {
    yield all([
      authSaga(),
      homeSaga(),
      profileSaga(),
      shopSaga(),
      categoriesSaga(),
      productSaga(),
      cartSaga(),
      paymentSaga(),
      notificationSaga(),
      chatSaga(),
    ]);
  } catch (error) {
    console.error(error);
  }
};
