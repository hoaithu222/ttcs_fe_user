/**
 * Cart Service
 *
 * Service layer để handle tất cả API calls liên quan đến cart
 */

import { userCartApi } from "@/core/api/cart";
import type {
  Cart,
  CartItem,
  AddCartItemRequest,
  UpdateCartItemRequest,
  ApiSuccess,
  CartResponse,
} from "@/core/api/cart/type";

// Helper function để lấy error message
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e?.response?.data?.message || e?.message || fallback;
  }
  return fallback;
};

export class CartService {
  /**
   * Lấy giỏ hàng của user hiện tại
   */
  static async getCart(): Promise<ApiSuccess<CartResponse>> {
    try {
      const response = await userCartApi.getCart();
      const cartData = (response as any)?.data || response;
      
      // Map backend response to frontend format
      const cart = this.mapCartResponse(cartData);
      
      return {
        success: true,
        data: { cart },
      } as ApiSuccess<CartResponse>;
    } catch (error) {
      throw CartService.handleError(error, "Failed to load cart");
    }
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  static async addItem(data: AddCartItemRequest): Promise<ApiSuccess<CartResponse>> {
    try {
      const response = await userCartApi.addItem(data);
      const cartData = (response as any)?.data || response;
      
      // Map backend response to frontend format
      const cart = this.mapCartResponse(cartData);
      
      return {
        success: true,
        data: { cart },
      } as ApiSuccess<CartResponse>;
    } catch (error) {
      throw CartService.handleError(error, "Failed to add item to cart");
    }
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  static async updateItem(
    itemId: string,
    data: UpdateCartItemRequest
  ): Promise<ApiSuccess<CartResponse>> {
    try {
      const response = await userCartApi.updateItem(itemId, data);
      const cartData = (response as any)?.data || response;
      
      // Map backend response to frontend format
      const cart = this.mapCartResponse(cartData);
      
      return {
        success: true,
        data: { cart },
      } as ApiSuccess<CartResponse>;
    } catch (error) {
      throw CartService.handleError(error, "Failed to update cart item");
    }
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  static async removeItem(itemId: string): Promise<ApiSuccess<CartResponse>> {
    try {
      const response = await userCartApi.removeItem(itemId);
      const cartData = (response as any)?.data || response;
      
      // Map backend response to frontend format
      const cart = this.mapCartResponse(cartData);
      
      return {
        success: true,
        data: { cart },
      } as ApiSuccess<CartResponse>;
    } catch (error) {
      throw CartService.handleError(error, "Failed to remove item from cart");
    }
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  static async clearCart(): Promise<ApiSuccess<void>> {
    try {
      return await userCartApi.clearCart();
    } catch (error) {
      throw CartService.handleError(error, "Failed to clear cart");
    }
  }

  /**
   * Map backend cart response to frontend format
   */
  private static mapCartResponse(cartData: any): Cart {
    if (!cartData) return cartData;

    const cartItems = cartData.cartItems || cartData.items || [];
    const mappedItems = cartItems.map((item: any) => {
      const product = typeof item.productId === "object" ? item.productId : null;
      const shop = typeof item.shopId === "object" ? item.shopId : null;
      const variantSnapshot = item.variantSnapshot || null;

      const variantIdValue = item.variantId
        ? typeof item.variantId === "string"
          ? item.variantId
          : item.variantId?._id || item.variantId?.toString?.()
        : undefined;

      // Prefer variant image if available
      const productImages = product?.images || [];
      const fallbackImage =
        productImages.length > 0
          ? typeof productImages[0] === "string"
            ? productImages[0]
            : productImages[0]?.url || ""
          : "";
      const productImage = variantSnapshot?.image || fallbackImage;

      // Calculate prices
      const basePrice =
        item.priceAtTime ??
        variantSnapshot?.price ??
        (typeof item.variantId === "object" && item.variantId?.price
          ? item.variantId.price
          : product?.price) ??
        0;
      const productDiscount = product?.discount || 0;
      const finalPrice = Math.max(0, basePrice - productDiscount);
      const totalPrice = finalPrice * item.quantity;

      const productPayload = product
        ? {
            _id: product._id,
            name: product.name,
            images: product.images,
            price: product.price,
            discount: product.discount,
            finalPrice: product.finalPrice,
            variants: product.variants || [],
          }
        : undefined;

      return {
        _id: item._id,
        cartId: item.cartId || cartData._id,
        productId: typeof item.productId === "string" ? item.productId : item.productId._id,
        variantId: variantIdValue,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime ?? basePrice,
        shopId: typeof item.shopId === "string" ? item.shopId : item.shopId._id,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        // Computed fields
        productName: product?.name || "",
        productImage,
        productPrice: basePrice,
        finalPrice,
        totalPrice,
        shopName: shop?.name || "",
        variantSnapshot: variantSnapshot || undefined,
        product: productPayload,
      } as CartItem;
    });


    // Calculate totals
    const subtotal = mappedItems.reduce((sum: number, item: CartItem) => sum + (item.totalPrice || 0), 0);
    const uniqueShops = new Set(mappedItems.map((item: CartItem) => item.shopId));
    const shopCount = uniqueShops.size;
    const itemCount = mappedItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

    return {
      _id: cartData._id,
      userId: cartData.userId,
      cartItems: mappedItems,
      items: mappedItems, // Alias for compatibility
      status: cartData.status,
      subtotal,
      discount: 0, // TODO: Calculate from product discounts
      couponDiscount: 0,
      shippingFee: 0, // TODO: Calculate shipping fee
      totalAmount: subtotal,
      itemCount,
      shopCount,
      createdAt: cartData.createdAt,
      updatedAt: cartData.updatedAt,
    } as Cart;
  }

  /**
   * Handle errors
   */
  static handleError(error: unknown, defaultMessage: string) {
    const message = getErrorMessage(error, defaultMessage);
    console.error(message, error);
    return new Error(message);
  }
}

