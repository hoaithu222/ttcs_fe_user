import { all } from "redux-saga/effects";
import { authSaga } from "@/features/Auth/components/slice/auth.saga";

export const rootSage = function* () {
  try {
    yield all([authSaga()]);
  } catch (error) {
    console.error(error);
  }
};
