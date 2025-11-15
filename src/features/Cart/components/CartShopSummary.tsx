import React from "react";
import { Store, Truck } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import { CartItem } from "@/core/api/cart/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";

interface CartShopSummaryProps {
  shopId: string;
  shopName: string;
  shopLogo?: string;
  items: CartItem[];
  onCheckout?: (shopId: string) => void;
  isLoading?: boolean;
}

const CartShopSummary: React.FC<CartShopSummaryProps> = ({
  shopId,
  shopName,
  shopLogo,
  items,
  onCheckout,
  isLoading = false,
}) => {
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = 0; // TODO: Calculate shipping fee per shop
  const totalAmount = subtotal + shippingFee;

  return (
    <div className="p-5 bg-background-2 rounded-xl border border-border-1 shadow-sm">
      {/* Shop Info */}
      <div className="flex gap-3 items-center mb-4 pb-4 border-b border-border-1">
        {shopLogo ? (
          <img
            src={shopLogo}
            alt={shopName}
            className="w-10 h-10 rounded-lg object-cover border border-border-1"
          />
        ) : (
          <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-primary-6/10 border border-border-1">
            <Store className="w-5 h-5 text-primary-6" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-neutral-9 truncate">{shopName}</h3>
          <p className="text-xs text-neutral-6">{itemCount} sản phẩm</p>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-neutral-6">Tạm tính</span>
          <span className="font-semibold text-neutral-9">{formatPriceVND(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-neutral-6" />
            <span className="text-neutral-6">Phí vận chuyển</span>
          </div>
          <span className="font-semibold text-neutral-9">
            {shippingFee > 0 ? formatPriceVND(shippingFee) : "Miễn phí"}
          </span>
        </div>

        <div className="h-px bg-border-1" />

        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-neutral-9">Tổng cộng</span>
          <span className="text-xl font-bold text-primary-6">{formatPriceVND(totalAmount)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      {onCheckout && (
        <Button
          color="blue"
          variant="solid"
          size="lg"
          fullWidth
          onClick={() => onCheckout(shopId)}
          disabled={isLoading || itemCount === 0}
          loading={isLoading}
        >
          Thanh toán shop này
        </Button>
      )}
    </div>
  );
};

export default CartShopSummary;

