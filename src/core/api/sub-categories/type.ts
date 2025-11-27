import type { SubCategory } from "@/core/api/categories/type";

export interface SubCategoryListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SubCategoryListResponse {
  subCategories: SubCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


