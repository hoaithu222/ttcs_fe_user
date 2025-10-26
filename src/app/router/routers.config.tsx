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
