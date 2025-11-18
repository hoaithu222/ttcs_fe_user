import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Edit, CheckCircle2, XCircle, Package, TrendingUp } from "lucide-react";
import { ShopProduct } from "@/core/api/shop-management/type";
import { ProductService } from "@/features/Shop/api";
import { addToast } from "@/app/store/slices/toast";
import Button from "@/foundation/components/buttons/Button";
import Image from "@/foundation/components/icons/Image";

interface GridViewProductProps {
  data: ShopProduct[];
  fetchData: () => void;
}

const GridViewProduct: React.FC<GridViewProductProps> = ({ data, fetchData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getImageUrl = (images: any[]): string => {
    if (!images || images.length === 0) return "";
    const firstImage = images[0];
    if (typeof firstImage === "string") return firstImage;
    return (firstImage as any)?.url || "";
  };

  const handleToggleStatus = async (product: ShopProduct) => {
    if (loading) return;

    setLoading(product._id);
    try {
      await ProductService.toggleProductStatus(product._id, !product.isActive);

      dispatch(
        addToast({
          type: "success",
          message: "Đã cập nhật trạng thái thành công",
        })
      );
      fetchData();
    } catch (error: any) {
      console.error("Error updating product:", error);
      dispatch(
        addToast({
          type: "error",
          message: error?.message || "Có lỗi xảy ra khi cập nhật trạng thái",
        })
      );
    } finally {
      setLoading(null);
    }
  };

  const handleEdit = (productId: string) => {
    navigate(`/shop/products/${productId}/edit`);
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data?.map((product) => (
        <div
          key={product._id}
          className="group overflow-hidden bg-background-1 rounded-xl shadow-md border border-border-1 transition-all duration-300 hover:shadow-xl hover:border-primary-3"
        >
          {/* Image Section */}
          <div className="relative overflow-hidden aspect-square bg-neutral-2">
            {getImageUrl(product.images) ? (
              <img
                src={getImageUrl(product.images)}
                alt={product.name}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex justify-center items-center w-full h-full">
                <Image alt="No image" className="w-16 h-16 text-neutral-4" />
              </div>
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Status Badge */}
            {!product.isActive && (
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-error/90 text-white text-xs font-medium rounded-md shadow-lg backdrop-blur-sm">
                Ngừng bán
              </div>
            )}
            
            {/* Sales Badge */}
            {product.salesCount && product.salesCount > 0 && (
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-success/90 text-white text-xs font-medium rounded-md shadow-lg backdrop-blur-sm flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {product.salesCount} đã bán
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4 space-y-3">
            {/* Product Info */}
            <div>
              <h3 className="mb-1 text-base font-semibold text-neutral-9 hover:text-primary-6 line-clamp-2 transition-colors cursor-pointer">
                {product.name}
              </h3>
              <p className="text-xs text-neutral-6 font-mono">ID: {product._id.slice(-8)}</p>
            </div>

            {/* Price and Stock */}
            <div className="flex justify-between items-center pt-2 border-t border-border-1">
              <div className="flex flex-col">
                {(() => {
                  const discountPercent = Math.min(
                    Math.max(product.discount ?? 0, 0),
                    100
                  );
                  const hasDiscount = discountPercent > 0;
                  const finalPrice =
                    product.finalPrice ??
                    product.price - (product.price * discountPercent) / 100;
                  return (
                    <>
                      <span className="font-bold text-lg text-primary-6">
                        {formatPrice(Math.max(0, finalPrice))}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-neutral-6 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-1 rounded-md">
                <Package className="w-4 h-4 text-neutral-6" />
                <span className="text-sm font-medium text-neutral-7">{product.stock || 0}</span>
              </div>
            </div>

            {/* Status */}
            <div>
              {product.isActive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-success-7 bg-success-1 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đang hiển thị
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-error-7 bg-error-1 rounded-md">
                  <XCircle className="w-3.5 h-3.5" />
                  Đã ẩn
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-center pt-2">
              <Button
                color={product.isActive ? "red" : "green"}
                variant="ghost"
                size="sm"
                icon={
                  product.isActive ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )
                }
                onClick={() => handleToggleStatus(product)}
                disabled={loading === product._id}
                className="flex-1"
              >
                {product.isActive ? "Ẩn" : "Kích hoạt"}
              </Button>
              <Button
                color="blue"
                variant="ghost"
                size="sm"
                icon={<Edit className="w-4 h-4" />}
                onClick={() => handleEdit(product._id)}
                className="flex-1"
              >
                Sửa
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridViewProduct;

