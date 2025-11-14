import { all } from "redux-saga/effects";
import { authSaga } from "@/features/Auth/components/slice/auth.saga";
import { homeSaga } from "@/features/Home/slice/home.saga";
import { profileSaga } from "@/features/Profile/slice/profile.saga";
import { shopSaga } from "@/features/Shop/slice/shop.saga";
import { categoriesSaga } from "@/features/Categories/slice/categories.saga";

export const rootSage = function* () {
  try {
    yield all([authSaga(), homeSaga(), profileSaga(), shopSaga(), categoriesSaga()]);
  } catch (error) {
    console.error(error);
  }
};
