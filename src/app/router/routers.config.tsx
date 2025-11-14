import { lazy } from "react";
import AuthPage from "@/features/Auth/AuthPage";

const HomePage = lazy(() => import("@/features/Home/HomePage"));
const ProductsPage = lazy(() => import("@/features/Products/ProductsPage"));
const ProductDetailPage = lazy(() => import("@/features/Products/ProductDetailPage"));
const CategoriesPage = lazy(() => import("@/features/Categories/CategoriesPage"));
const CartPage = lazy(() => import("@/features/Cart/CartPage"));
const OrdersPage = lazy(() => import("@/features/Orders/OrdersPage"));
const WishlistPage = lazy(() => import("@/features/Wishlist/WishlistPage"));
const ProfilePage = lazy(() => import("@/features/Profile/ProfilePage"));
const ShopEntryPage = lazy(() => import("@/features/Shop/ShopEntryPage"));
const RegisterShopPage = lazy(() => import("@/features/Shop/pages/RegisterShopPage"));
const ShopReviewPage = lazy(() => import("@/features/Shop/pages/ShopReviewPage"));
const ShopReviewManagerPage = lazy(() => import("@/features/Shop/pages/ShopReviewManagerPage"));
const ShopDashboardPage = lazy(() => import("@/features/Shop/pages/ShopDashboardPage"));
const ShopSuspendedPage = lazy(() => import("@/features/Shop/pages/ShopSuspendedPage"));
const ShopInfoPage = lazy(() => import("@/features/Shop/pages/ShopInfoPage"));
const AddProductPage = lazy(() => import("@/features/Shop/pages/AddProductPage"));
const ListProductPage = lazy(() => import("@/features/Shop/pages/ListProductPage"));
const OrderShopPage = lazy(() => import("@/features/Shop/pages/OrderShopPage"));

const defaultOptions = {
  requireAuth: false,
  hideInMenu: false,
};
const defaultAuthOptions = {
  ...defaultOptions,
  requireAuth: false,
};
const defaultProtectedOptions = {
  ...defaultOptions,
  requireAuth: true,
};

export const ROUTE = {
  home: {
    path: "/",
    element: <HomePage />,
    layout: "main",
    options: defaultOptions,
  },
  auth: {
    path: "/login",
    element: <AuthPage />,
    layout: "auth",
    options: defaultAuthOptions,
  },
  register: {
    path: "/register",
    element: <AuthPage />,
    layout: "auth",
    options: defaultAuthOptions,
  },
  forgotPassword: {
    path: "/forgot-password",
    element: <AuthPage />,
    layout: "auth",
    options: defaultAuthOptions,
  },
  products: {
    path: "/products",
    element: <ProductsPage />,
    layout: "main",
    options: defaultOptions,
  },
  productDetail: {
    path: "/products/:id",
    element: <ProductDetailPage />,
    layout: "main",
    options: defaultOptions,
  },
  categories: {
    path: "/categories",
    element: <CategoriesPage />,
    layout: "main",
    options: defaultOptions,
  },
  categoryDetail: {
    path: "/categories/:id",
    element: <CategoriesPage />,
    layout: "main",
    options: defaultOptions,
  },
  cart: {
    path: "/cart",
    element: <CartPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  orders: {
    path: "/orders",
    element: <OrdersPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  wishlist: {
    path: "/wishlist",
    element: <WishlistPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  profile: {
    path: "/profile",
    element: <ProfilePage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  shop: {
    path: "/shop",
    element: <ShopEntryPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  shopRegister: {
    path: "/shop/register",
    element: <RegisterShopPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  shopReview: {
    path: "/shop/review",
    element: <ShopReviewPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  shopReviewManager: {
    path: "/shop/reviews",
    element: <ShopReviewManagerPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  shopDashboard: {
    path: "/shop/dashboard",
    element: <ShopDashboardPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  shopSuspended: {
    path: "/shop/suspended",
    element: <ShopSuspendedPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  shopInfo: {
    path: "/shop/info",
    element: <ShopInfoPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  shopEntry: {
    path: "/shop",
    element: <ShopEntryPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  addProduct: {
    path: "/shop/add-product",
    element: <AddProductPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  listProduct: {
    path: "/shop/list-product",
    element: <ListProductPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  ordersShopManager: {
    path: "/shop/orders",
    element: <OrderShopPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
} satisfies Record<
  string,
  {
    path: string;
    element: React.ReactNode;
    layout: React.ReactNode;
    options: {
      requireAuth: boolean;
      hideInMenu: boolean;
    };
  }
>;
