// Định nghĩa các route cho navigation của user

export interface NavigationConfig {
  path: string;
  name: string;
  requireAuth: boolean;
}

export const NAVIGATION_CONFIG: Record<string, NavigationConfig> = {
  home: {
    path: "/",
    name: "Trang chủ",
    requireAuth: false,
  },
  login: {
    path: "/login",
    name: "Đăng nhập",
    requireAuth: false,
  },
  register: {
    path: "/register",
    name: "Đăng ký",
    requireAuth: false,
  },
  forgotPassword: {
    path: "/forgot-password",
    name: "Quên mật khẩu",
    requireAuth: false,
  },
  profile: {
    path: "/profile",
    name: "Hồ sơ",
    requireAuth: true,
  },
  deposit: {
    path: "/wallet/deposit",
    name: "Nạp tiền",
    requireAuth: true,
  },
  cart: {
    path: "/cart",
    name: "Giỏ hàng",
    requireAuth: true,
  },
  orders: {
    path: "/orders",
    name: "Đơn hàng",
    requireAuth: true,
  },
  wishlist: {
    path: "/wishlist",
    name: "Yêu thích",
    requireAuth: true,
  },
  products: {
    path: "/products",
    name: "Sản phẩm",
    requireAuth: false,
  },
  productDetail: {
    path: "/products/:id",
    name: "Chi tiết sản phẩm",
    requireAuth: false,
  },
  categories: {
    path: "/categories",
    name: "Danh mục",
    requireAuth: false,
  },
  search: {
    path: "/search",
    name: "Tìm kiếm",
    requireAuth: false,
  },
  about: {
    path: "/about",
    name: "Giới thiệu",
    requireAuth: false,
  },
  contact: {
    path: "/contact",
    name: "Liên hệ",
    requireAuth: false,
  },
  shop: {
    path: "/shop/info",
    name: "Quản lý cửa hàng",
    requireAuth: true,
  },
  shopEntry: {
    path: "/shop",
    name: "Cửa hàng",
    requireAuth: true,
  },
  shopRegister: {
    path: "/shop/register",
    name: "Đăng ký cửa hàng",
    requireAuth: true,
  },
  shopReview: {
    path: "/shop/review",
    name: "Đánh giá cửa hàng",
    requireAuth: true,
  },
  shopReviewManager: {
    path: "/shop/reviews",
    name: "Quản lý đánh giá",
    requireAuth: true,
  },
  shopDashboard: {
    path: "/shop/dashboard",
    name: "Bảng điều khiển cửa hàng",
    requireAuth: true,
  },
  shopSuspended: {
    path: "/shop/suspended",
    name: "Cửa hàng bị khóa",
    requireAuth: true,
  },
  addProduct: {
    path: "/shop/add-product",
    name: "Thêm sản phẩm mới",
    requireAuth: true,
  },
  editProduct: {
    path: "/shop/products/:productId/edit",
    name: "Chỉnh sửa sản phẩm",
    requireAuth: true,
  },
  listProduct: {
    path: "/shop/list-product",
    name: "Danh sách sản phẩm",
    requireAuth: true,
  },
  ordersShopManager: {
    path: "/shop/orders",
    name: "Đơn hàng cửa hàng",
    requireAuth: true,
  },
  chat: {
    path: "/chat",
    name: "Chat",
    requireAuth: true,
  },
} satisfies Record<string, NavigationConfig>;
