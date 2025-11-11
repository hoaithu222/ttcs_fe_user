import { ReduxStateType } from "@/app/store/types";
import { Category } from "@/core/api/categories/type";
import { Product } from "@/core/api/products/type";
import { Shop } from "@/core/api/shops/type";

// quan ly giao dien home banner hien tai se cau hinh them o backend có thể thay đổi được

export interface HomeState {
  // banner
  home_banner: {
    data: any;
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
  // hiển thị danh sách category
  home_category: {
    data: Category[];
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  // hiển thị danh sách product best seller
  home_product_best_seller: {
    data: Product[];
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  // hiển thị danh sách shop best seller
  home_shop: {
    data: Shop[];
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };

  // hiển thị danh sách sản phẩm flash sale
  home_product_flash_sale: {
    data: Product[];
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  // danh sách gọi ý tìm kiếm
  home_product_search_suggestion: {
    data: {
      products: Product[];
    };
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
