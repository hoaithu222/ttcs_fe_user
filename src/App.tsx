import { RouterProvider } from "react-router-dom";
import { router } from "./app/router/routers";

const App = () => {
  // const dispatch = useDispatch();

  // check authentication  lấy thông tin người dùng

  return <RouterProvider router={router} />;
};

export default App;
