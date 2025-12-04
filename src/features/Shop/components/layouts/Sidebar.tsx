import { Link, useLocation } from "react-router-dom";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import { ShoppingCart, Store, Package, Plus, BarChart3, Star } from "lucide-react";
const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: "dashboard",
      label: "Bảng điều khiển",
      icon: BarChart3,
      path: NAVIGATION_CONFIG.shopDashboard.path,
    },
    {
      key: "manage-info",
      label: "Quản lý cửa hàng",
      icon: Store,
      path: NAVIGATION_CONFIG.shop.path,
    },
    {
      key: "addproduct",
      label: "Thêm sản phẩm mới",
      icon: Plus,
      path: NAVIGATION_CONFIG.addProduct.path,
    },
    {
      key: "list-product",
      label: "Danh sách sản phẩm",
      icon: Package,
      path: NAVIGATION_CONFIG.listProduct.path,
    },
    {
      key: "orders",
      label: "Đơn hàng",
      icon: ShoppingCart,
      path: NAVIGATION_CONFIG.ordersShopManager.path,
    },
    {
      key: "reviews",
      label: "Đánh giá",
      icon: Star,
      path: NAVIGATION_CONFIG.shopReviewManager.path,
    },
  ];

  return (
    <div className="flex flex-col h-full border-r shadow-lg  border-border-2">
      {/* Navigation Menu */}
      <nav className="overflow-y-auto flex-1 pr-4 py-6 space-y-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.key}
              to={item.path}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`group relative flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                isActive
                  ? "shadow-md text-primary-6 bg-primary-2 hover:bg-primary-3"
                  : "text-neutral-6 hover:text-primary-6 hover:bg-neutral-2/70 hover:shadow-sm"
              }`}
            >
              {/* Active Background Layer */}
              {isActive && (
                <>
                  <div className="absolute left-0 top-1/2 w-1 h-10 bg-gradient-to-b rounded-r-full shadow-sm -translate-y-1/2 from-primary-6 to-primary-8" />
                  <div className="absolute inset-0 bg-gradient-to-r to-transparent rounded-xl from-primary-6/5" />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-primary-6/20" />
                </>
              )}

              {/* Hover Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-r to-transparent rounded-xl opacity-0 transition-opacity duration-300 from-primary-6/10 group-hover:opacity-100" />

              {/* Icon Container with Animation */}
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "text-white bg-gradient-to-br shadow-md scale-105 from-primary-6 to-primary-8"
                    : "bg-icon-rounded-first text-neutral-6 group-hover:bg-primary-10/50 group-hover:text-primary-6 group-hover:scale-105 group-hover:shadow-sm"
                }`}
              >
                <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-tr to-transparent rounded-lg from-white/20" />
                )}
              </div>

              {/* Label */}
              <span
                className={`relative text-sm font-medium flex-1 transition-all duration-300 ${
                  isActive ? "font-semibold text-primary-6" : "group-hover:font-medium"
                }`}
              >
                {item.label}
              </span>

              {/* Active Badge */}
              {isActive && (
                <div className="absolute right-3 top-1/2 w-2 h-2 rounded-full shadow-sm animate-pulse -translate-y-1/2 bg-primary-6" />
              )}

              {/* Hover Arrow with Animation */}
              {!isActive && (
                <div className="opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-6" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
