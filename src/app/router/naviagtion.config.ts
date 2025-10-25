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
} satisfies Record<string, NavigationConfig>;
