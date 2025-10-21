import { Middleware } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { rootSage } from "../root-saga";

const sagaMiddleware = createSagaMiddleware();

const devMiddlewares: Middleware[] = [];

export const getMiddlewares = (): Middleware[] => {
  return [...devMiddlewares, sagaMiddleware];
};
export const runSageMiddleware = () => {
  sagaMiddleware.run(rootSage);
};

export default sagaMiddleware;
