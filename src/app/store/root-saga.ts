import { all } from "redux-saga/effects";

export const rootSage = function* () {
  try {
    yield all([]);
  } catch (error) {
    console.error(error);
  }
};
