import { Product } from "@/core/api/products/type";
import { ReduxStateType } from "@/app/store/types";
import { ProductReview } from "@/core/api/products/type";
import { Shop } from "@/core/api/shops/type";
export interface InitProductState {
  // danh sách product
  products: {
    data: Product[];
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
  // id product hiện tại
  currentProductId: string | null;
  // chi tiết product
  productDetail: {
    data: Product | null;
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
  // danh sách related products
  relatedProducts: {
    data: Product[];
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
  // danh sách reviews
  reviews: {
    data: ProductReview[];
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
  // thông tin shop của product
  shop: {
    data: Shop | null;
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
}
