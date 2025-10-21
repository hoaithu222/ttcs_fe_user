import { persistReducer, persistStore } from "redux-persist";
import { rootReducer } from "./root-reducer";

import { persistConfig } from "./persist-config";
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import sagaMiddleware, { runSageMiddleware } from "./setup/middlewares";

const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(sagaMiddleware),
});

runSageMiddleware(); // rõ ràng và đúng thời điểm

export const persistor = persistStore(store);

// định nghĩa sau khi store đã đc tạo

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
