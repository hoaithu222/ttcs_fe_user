import {
  createSlice,
  SliceCaseReducers,
  CaseReducer,
  ValidateSliceCaseReducers,
} from "@reduxjs/toolkit";
import { persistReducer, PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";

interface PersistOptions<S> {
  key?: string;
  storage?: typeof storage;
  whitelist?: (keyof S)[];
  blacklist?: (keyof S)[];
  version?: number;
}

interface CreateResettableSliceOptions<S, R extends SliceCaseReducers<S>> {
  name: string;
  initialState: S;
  reducers: R;
  persist?: PersistOptions<S>;
}

export function createResettableSlice<S, R extends SliceCaseReducers<S>>(
  options: CreateResettableSliceOptions<S, R>
) {
  const resetState: CaseReducer<S> = () => options.initialState;

  const slice = createSlice({
    name: options.name,
    initialState: options.initialState,
    reducers: {
      ...(options.reducers as ValidateSliceCaseReducers<S, R>),
      resetState,
    },
  });

  const persistConfig: PersistConfig<S> = {
    key: options.persist?.key || options.name,
    storage: options.persist?.storage || storage,
    whitelist: options.persist?.whitelist as string[] | undefined,
    blacklist: options.persist?.blacklist as string[] | undefined,
    version: options.persist?.version || 1,
  };

  const reducer = options.persist ? persistReducer(persistConfig, slice.reducer) : slice.reducer;

  return {
    slice,
    reducer,
    actions: slice.actions,
  };
}
