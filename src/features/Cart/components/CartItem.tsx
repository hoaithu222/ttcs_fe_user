import React from "react";
import { Trash2, Plus, Minus, Package } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { CartItem as CartItemType } from "@/core/api/cart/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isLoading?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
  isLoading = false,
}) => {
  const handleIncrease = () => {
    onQuantityChange(item._id, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item._id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      onRemove(item._id);
    }
  };

  const productImage = item.productImage || "";
  const productName = item.productName || "Sản phẩm";
  const finalPrice = item.finalPrice || item.productPrice || item.priceAtTime || 0;
  const totalPrice = item.totalPrice || finalPrice * item.quantity;

  return (
    <div className="flex gap-4 p-4 bg-background-1 rounded-xl border border-border-1 hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="flex-shrink-0">
        {productImage ? (
          <img
            src={productImage}
            alt={productName}
            className="w-24 h-24 rounded-lg object-cover border border-border-1"
          />
        ) : (
          <div className="flex justify-center items-center w-24 h-24 rounded-lg bg-neutral-2 border border-border-1">
            <Package className="w-8 h-8 text-neutral-4" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-neutral-9 mb-1 line-clamp-2">
              {productName}
            </h3>
            {item.shopName && (
              <p className="text-sm text-neutral-6 mb-2">Cửa hàng: {item.shopName}</p>
            )}
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-primary-6">
                {formatPriceVND(finalPrice)}
              </span>
              {item.productPrice && item.productPrice > finalPrice && (
                <span className="text-sm text-neutral-5 line-through">
                  {formatPriceVND(item.productPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Remove Button */}
          <Button
            color="gray"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isLoading}
            icon={<Trash2 className="w-4 h-4" />}
            className="flex-shrink-0"
          />
        </div>

        {/* Quantity Controls */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <Button
              color="gray"
              variant="outline"
              size="sm"
              onClick={handleDecrease}
              disabled={isLoading || item.quantity <= 1}
              icon={<Minus className="w-4 h-4" />}
            />
            <span className="w-12 text-center font-semibold text-neutral-9">{item.quantity}</span>
            <Button
              color="gray"
              variant="outline"
              size="sm"
              onClick={handleIncrease}
              disabled={isLoading}
              icon={<Plus className="w-4 h-4" />}
            />
          </div>

          {/* Total Price */}
          <div className="text-right">
            <p className="text-sm text-neutral-6">Thành tiền</p>
            <p className="text-xl font-bold text-primary-6">{formatPriceVND(totalPrice)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;

