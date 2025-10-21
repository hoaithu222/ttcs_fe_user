//lưu dữ liệu ở local storage
import { PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { rootReducer } from "./root-reducer";

export const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: "root",
  storage,
  // Không add key ở đây, nếu cần đồng bộ với local thì thêm ở từng feature thêm whitelist ở đó
  whitelist: [],
};
