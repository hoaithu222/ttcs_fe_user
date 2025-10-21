import React, { useEffect } from "react";
import { RootState } from "../store";
import { useSelector } from "react-redux";
import { themeRootSelector } from "../store/slices/theme/selectors";

const ThemProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useSelector((state: RootState) => themeRootSelector(state));
  // sử dụng custom hook để lấy kích thước màn hình

  // cập nhật theme (thêm bớt class dark) theo giá trị của redux
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <div>{children}</div>;
};

export default ThemProvider;
