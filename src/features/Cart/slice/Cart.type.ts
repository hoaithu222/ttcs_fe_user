import { Cart } from "@/core/api/cart/type";
import { ReduxStateType } from "@/app/store/types";

export interface initDataCart {
  // giò hàng
  my_cart: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    cart: Cart;
  };
  // thêm vào giỏ hàng
  add_to_cart: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    cart: Cart;
  };
  // xóa khỏi giỏ hàng
  delete_from_cart: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    cart: Cart;
  };
  // cập nhật số lượng
  update_quantity: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    cart: Cart;
  };
}
