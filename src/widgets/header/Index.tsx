import {
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Moon,
  Sun,
  ShoppingCart,
  ShoppingBagIcon,
} from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { useAuth } from "@/features/Auth/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

import Image from "@/foundation/components/icons/Image";
import IconButton from "@/foundation/components/buttons/IconButton";
import { RootState } from "@/app/store";
import { themeRootSelector } from "@/app/store/slices/theme/selectors";
import { toggleTheme } from "@/app/store/slices/theme";
import { useDispatch } from "react-redux";
import SearchInput from "@/foundation/components/input/search-input/SearchInput";
import * as Form from "@radix-ui/react-form";
import { useNavigate } from "react-router-dom";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import { useAppSelector, useAppDispatch } from "@/app/store";
import {
  selectShopUiScreens,
  selectShopFetchStatus,
  selectShopStatusByUserStatus,
} from "@/features/Shop/slice/shop.selector";
import { fetchShopStatusByUserStart } from "@/features/Shop/slice/shop.slice";
import { ReduxStateType } from "@/app/store/types";

const Header = () => {
  const { user, onLogout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const appDispatch = useAppDispatch();
  const navigation = useNavigate();
  const { theme } = useSelector((state: RootState) => themeRootSelector(state));
  const shopUi = useAppSelector(selectShopUiScreens);
  const shopFetchStatus = useAppSelector(selectShopFetchStatus);
  const shopStatusByUserStatus = useAppSelector(selectShopStatusByUserStatus);

  const getShopMenuLabel = () => {
    if (
      shopFetchStatus === ReduxStateType.LOADING ||
      shopStatusByUserStatus === ReduxStateType.LOADING
    )
      return "Đang tải cửa hàng...";
    if (shopUi?.showActiveDashboard) return "Vào cửa hàng của tôi";
    if (shopUi?.showSetup) return "Tiếp tục thiết lập cửa hàng";
    if (shopUi?.showPendingReview) return "Hồ sơ đang chờ duyệt";
    if (shopUi?.showSuspended) return "Cửa hàng bị hạn chế";
    return "Đăng kí bán hàng";
  };

  // Fetch shop status when user is logged in
  useEffect(() => {
    if (user?._id && shopStatusByUserStatus !== ReduxStateType.LOADING) {
      // Only fetch if not already loading and user exists
      appDispatch(fetchShopStatusByUserStart({ userId: user._id }));
    }
  }, [user?._id, appDispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    onLogout();
    setIsDropdownOpen(false);
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return (
    <header className="overflow-visible border-b shadow-sm border-border-2 bg-header">
      <div className="container flex overflow-visible justify-between items-center mx-auto h-16">
        {/* Left side - Logo/Brand */}
        <div className="flex items-center space-x-4">
          <div
            className="flex overflow-hidden items-center space-x-2 w-12 h-12 rounded-lg cursor-pointer lg:w-14 lg:h-14"
            onClick={() => navigation(NAVIGATION_CONFIG.home.path)}
          >
            <Image name="logo" alt="logo" />
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex flex-1 justify-center items-center mx-4 max-w-md md:mx-8">
          <div className="relative w-full">
            {/* Search Input Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 blur-sm transition-opacity duration-300 from-primary-6/20 via-primary-8/10 to-primary-6/20 hover:opacity-100" />

            {/* Search Input Border Effect */}
            <div className="absolute inset-0 rounded-xl border opacity-0 transition-all duration-300 pointer-events-none border-primary-6/30 hover:opacity-100" />

            <div className="relative">
              <Form.Root>
                <Form.Field name="search">
                  <SearchInput
                    searchItems={[]}
                    name="search"
                    sizeInput="xl"
                    inputWrapperClassName="w-full"
                    inputClassName="focus:ring-2 focus:ring-primary-6/50 focus:border-primary-6 transition-all duration-300 h-12"
                  />
                </Form.Field>
              </Form.Root>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Dark/Light Mode Toggle */}
          <IconButton
            icon={theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            variant="ghost"
            onClick={handleToggleTheme}
            tooltip={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            ariaLabel={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          />

          {user ? (
            <>
              {/* Shopping Cart */}
              <IconButton
                icon={<ShoppingCart className="w-5 h-5" />}
                variant="ghost"
                notification={true}
                tooltip="Shopping Cart"
                onClick={() => navigation(NAVIGATION_CONFIG.cart.path)}
              />

              {/* Notifications */}
              <IconButton
                icon={<Bell className="w-5 h-5" />}
                variant="ghost"
                notification={true}
                tooltip="Notifications"
                ariaLabel="Notifications"
              />

              {/* User Profile Dropdown */}
              <div className="relative z-50" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center px-3 py-2 space-x-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || ""}</p>
                  </div>
                  <div className="flex justify-center items-center w-8 h-8 bg-gray-300 rounded-full dark:bg-gray-600">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 z-[100] py-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                    {/* Quản lý tài khoản */}
                    <button
                      onClick={() => {
                        navigation(`${NAVIGATION_CONFIG.profile.path}?tab=account`);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center px-4 py-2 space-x-3 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <User className="w-4 h-4" />
                      <span>My Account</span>
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-2 space-x-3 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    {/* Đăng kí bán hàng */}

                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={() => {
                        navigation("/shop");
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center px-4 py-2 space-x-3 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      <span>{getShopMenuLabel()}</span>
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 space-x-3 w-full text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Login Button */}
              <Button
                variant="solid"
                size="sm"
                onClick={() => navigation(NAVIGATION_CONFIG.login.path)}
                className="px-4"
              >
                Đăng nhập
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
