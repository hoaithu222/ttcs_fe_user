import { createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { AppReducerType } from "../types";

import { MODE } from "@/app/config/env.config";
const Transform = createTransform<unknown, unknown>(
  (inboundState, _key) => {
    return inboundState;
  },
  (outboundState, _key) => {
    return outboundState;
  }
);

export const persistConfig = {
  timeout: MODE === "dev" ? 0 : 3000,
  key: "root",
  storage,
  version: 1,

  whitelist: [AppReducerType.LANGUAGE, AppReducerType.THEME],
  transforms: [Transform],
};
