import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2 } from "lucide-react";
import Image from "@/foundation/components/icons/Image";

interface CartItemCardProps {
    productId: string;
    productName: string;
    productImage?: string;
    productPrice: number;
    quantity: number;
    shopName?: string;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
    productId,
    productName,
    productImage,
    productPrice,
    quantity,
    shopName,
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/product/${productId}`);
    };

    const totalPrice = productPrice * quantity;

    return (
        <div
            onClick={handleClick}
            className="flex items-center gap-3 p-3 bg-white border border-neutral-3 rounded-lg hover:border-primary-5 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
            {productImage ? (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-neutral-2">
                    <Image
                        src={productImage}
                        alt={productName}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-neutral-2 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-neutral-5" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-neutral-10 truncate mb-1">
                    {productName}
                </h4>

                {shopName && (
                    <p className="text-xs text-neutral-6 truncate mb-1">
                        {shopName}
                    </p>
                )}

                <div className="flex items-center gap-2 text-xs">
                    <span className="text-neutral-6">SL: {quantity}</span>
                    <span className="text-neutral-4">•</span>
                    <span className="font-semibold text-primary-6">
                        {new Intl.NumberFormat("vi-VN").format(totalPrice)}đ
                    </span>
                </div>
            </div>

            <div className="text-primary-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );
};

export default CartItemCard;
