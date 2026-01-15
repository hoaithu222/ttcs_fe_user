import { lazy } from "react";
import AuthPage from "@/features/Auth/AuthPage";

const HomePage = lazy(() => import("@/features/Home/HomePage"));
const ProductsPage = lazy(() => import("@/features/Products/ProductsPage"));
const ProductDetailPage = lazy(() => import("@/features/Products/ProductDetailPage"));
const CategoriesPage = lazy(() => import("@/features/Categories/CategoriesPage"));
const SubCategoryPage = lazy(() => import("@/features/SubCategories/SubCategoryPage"));
const CartPage = lazy(() => import("@/features/Cart/CartPage"));
const OrdersPage = lazy(() => import("@/features/Orders/OrdersPage"));
const CheckoutPage = lazy(() => import("@/features/Payment/pages/CheckoutPage"));
const PaymentPage = lazy(() => import("@/features/Payment/pages/PaymentPage"));
const PaymentResultPage = lazy(() => import("@/features/Payment/pages/PaymentResultPage"));
const PaymentHistoryPage = lazy(() => import("@/features/Payment/pages/PaymentHistoryPage"));
const WishlistPage = lazy(() => import("@/features/Wishlist/WishlistPage"));
const ProfilePage = lazy(() => import("@/features/Profile/ProfilePage"));
const DepositPage = lazy(() => import("@/features/Profile/pages/DepositPage"));
const ShopEntryPage = lazy(() => import("@/features/Shop/ShopEntryPage"));
const RegisterShopPage = lazy(() => import("@/features/Shop/pages/RegisterShopPage"));
const ShopReviewPage = lazy(() => import("@/features/Shop/pages/ShopReviewPage"));
const ShopReviewManagerPage = lazy(() => import("@/features/Shop/pages/ShopReviewManagerPage"));
const ShopDashboardPage = lazy(() => import("@/features/Shop/pages/ShopDashboardPage"));
const ShopSuspendedPage = lazy(() => import("@/features/Shop/pages/ShopSuspendedPage"));
const ShopInfoPage = lazy(() => import("@/features/Shop/pages/ShopInfoPage"));
const AddProductPage = lazy(() => import("@/features/Shop/pages/AddProductPage"));
const EditProductPage = lazy(() => import("@/features/Shop/pages/EditProductPage"));
const ListProductPage = lazy(() => import("@/features/Shop/pages/ListProductPage"));
const OrderShopPage = lazy(() => import("@/features/Shop/pages/OrderShopPage"));
const ShopDetailPage = lazy(() => import("@/features/Shop/pages/ShopDetailPage"));
const ChatPage = lazy(() => import("@/features/Chat/pages/ChatPage"));
const AuthCallback = lazy(() => import("@/features/Auth/components/AuthCallback"));

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
  authCallback: {
    path: "/auth/callback",
    element: <AuthCallback />,
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
  subCategoryDetail: {
    path: "/sub-categories/:id",
    element: <SubCategoryPage />,
    layout: "main",
    options: defaultOptions,
  },
  cart: {
    path: "/cart",
    element: <CartPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  checkout: {
    path: "/checkout",
    element: <CheckoutPage />,
    layout: "main",
    options: defaultProtectedOptions,
  },
  payment: {
    path: "/payment/:orderId",
    element: <PaymentPage />,
    layout: "extension",
    options: defaultProtectedOptions,
  },
  paymentResult: {
    path: "/payment/result/:orderId",
    element: <PaymentResultPage />,
    layout: "extension",
    options: defaultProtectedOptions,
  },
  paymentHistory: {
    path: "/payment/history",
    element: <PaymentHistoryPage />,
    layout: "extension",
    options: defaultProtectedOptions,
  },
  orders: {
    path: "/orders",
    element: <OrdersPage />,
    layout: "extension",
    options: defaultProtectedOptions,
  },
  wishlist: {
    path: "/wishlist",
    element: <WishlistPage />,
    layout: "extension",
    options: defaultProtectedOptions,
  },
  profile: {
    path: "/profile",
    element: <ProfilePage />,
    layout: "extension",
    options: defaultProtectedOptions,
  },
  deposit: {
    path: "/wallet/deposit",
    element: <DepositPage />,
    layout: "extension",
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
    layout: "extension",
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
    layout: "extension",
    options: defaultProtectedOptions,
  },
  shopEntry: {
    path: "/shop",
    element: <ShopEntryPage />,
    layout: "extension",
    options: defaultProtectedOptions,
  },
  addProduct: {
    path: "/shop/add-product",
    element: <AddProductPage />,
    layout: "extension",
    options: defaultProtectedOptions,
  },
  editProduct: {
    path: "/shop/products/:productId/edit",
    element: <EditProductPage />,
    layout: "extension",
    options: defaultProtectedOptions,
  },
  listProduct: {
    path: "/shop/list-product",
    element: <ListProductPage />,
    layout: "extension",
    options: defaultProtectedOptions,
  },
  ordersShopManager: {
    path: "/shop/orders",
    element: <OrderShopPage />,
    layout: "extension",
    options: defaultProtectedOptions,
  },
  shopDetail: {
    path: "/shops/:id",
    element: <ShopDetailPage />,
    layout: "main",
    options: defaultOptions,
  },
  chat: {
    path: "/chat",
    element: <ChatPage />,
    layout: "extension",
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
