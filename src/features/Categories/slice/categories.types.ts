import { ReduxStateType } from "@/app/store/types";
import { Category, SubCategory } from "@/core/api/categories/type";
import { Product } from "@/core/api/products/type";

export interface CategoriesState {
  // Danh sách tất cả categories
  categories: {
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
  // Category detail hiện tại
  currentCategory: {
    data: Category | null;
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
  // Subcategories của category hiện tại
  subCategories: {
    data: SubCategory[];
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
  // Products của category hiện tại
  categoryProducts: {
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
}
