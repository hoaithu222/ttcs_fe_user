import { RouterProvider } from "react-router-dom";
import { router } from "./app/router/routers";
import { useTranslation } from "react-i18next";
import { RootState } from "./app/store";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const App = () => {
  // const dispatch = useDispatch();

  // check authentication  lấy thông tin người dùng

  return <RouterProvider router={router} />;
};

export default App;
