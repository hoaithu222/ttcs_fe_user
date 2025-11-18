import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCartStart } from "../slice/Cart.slice";
import { Product, ProductVariant } from "@/core/api/products/type";
import { AddCartItemRequest } from "@/core/api/cart/type";

/**
 * Custom hook để handle thêm sản phẩm vào giỏ hàng
 */
export const useAddToCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param product - Product object
   * @param quantity - Số lượng (mặc định: 1)
   * @param variant - Variant được chọn (nếu có)
   * @param options - Options: showToast, redirectToCart
   */
  const addToCart = (
    product: Product,
    quantity: number = 1,
    variant?: ProductVariant | null,
    options?: {
      showToast?: boolean;
      redirectToCart?: boolean;
    }
  ) => {
    // Validate product
    if (!product || !product._id) {
      console.error("Invalid product");
      return;
    }

    // Validate stock
    const currentStock = variant?.stock ?? product.stock ?? 0;
    if (currentStock === 0) {
      console.warn("Product is out of stock");
      return;
    }

    // Validate quantity
    if (quantity <= 0 || quantity > currentStock) {
      console.warn("Invalid quantity");
      return;
    }

    // Calculate price with discount %
    const basePrice = variant?.price ?? product.price ?? 0;
    const discountPercent = Math.min(
      Math.max(product.discount ?? 0, 0),
      100
    );
    const discountedPrice =
      product.finalPrice && !variant
        ? product.finalPrice
        : basePrice - (basePrice * discountPercent) / 100;
    const finalPrice = Math.max(0, discountedPrice);

    // Prepare cart item request
    const cartItem: AddCartItemRequest = {
      productId: product._id,
      variantId: variant?._id || variant?.id,
      quantity,
      priceAtTime: finalPrice,
      shopId: product.shopId || (product.shop?._id as string) || "",
    };

    // Dispatch add to cart action
    dispatch(addToCartStart(cartItem));

    // Redirect to cart if option is enabled
    if (options?.redirectToCart) {
      navigate("/cart");
    }
  };

  return { addToCart };
};

