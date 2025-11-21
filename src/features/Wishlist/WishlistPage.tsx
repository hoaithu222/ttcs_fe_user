import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Trash2, ShoppingCart, Package } from "lucide-react";
import Page from "@/foundation/components/layout/Page";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import Button from "@/foundation/components/buttons/Button";
import ProductCard from "@/features/Products/components/ProductCard";
import { useWishlist } from "@/features/Profile/hooks/useWishlist";
import { useAddToCart } from "@/features/Cart/hooks/useAddToCart";
import type { WishlistItem } from "@/core/api/wishlist/type";
import { Product } from "@/core/api/products/type";
import ConfirmModal from "@/foundation/components/modal/ModalConfirm";
import { ReduxStateType } from "@/app/store/types";

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { wishlist, loadWishlist, removeFromWishlist, clearWishlist, wishlistStatus } = useWishlist();
  const { addToCart } = useAddToCart();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemoveItem = async (productId: string) => {
    setRemovingItemId(productId);
    try {
      await removeFromWishlist(productId);
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleClearWishlist = async () => {
    setIsClearModalOpen(false);
    await clearWishlist();
  };

  const handleAddToCart = (item: WishlistItem) => {
    // Convert WishlistItem to Product format for addToCart
    const product: Product = {
      _id: item.productId,
      name: item.productName,
      images: item.productImage ? [item.productImage] : [],
      price: item.productPrice,
      discount: item.productDiscount,
      finalPrice: item.finalPrice,
      shopId: item.shopId,
      shop: {
        _id: item.shopId,
        name: item.shopName,
      },
    } as Product;

    addToCart(product, 1, undefined, { showToast: true });
  };

  // Convert WishlistItem to Product for ProductCard
  const wishlistItemToProduct = (item: WishlistItem): Product => {
    return {
      _id: item.productId,
      name: item.productName,
      images: item.productImage ? [item.productImage] : [],
      price: item.productPrice,
      discount: item.productDiscount,
      finalPrice: item.finalPrice,
      shopId: item.shopId,
      shop: {
        _id: item.shopId,
        name: item.shopName,
      },
      isInWishlist: true,
    } as Product;
  };

  if (wishlistStatus === ReduxStateType.LOADING) {
    return (
      <Page>
        <div className="container mx-auto px-4 py-8">
          <Loading layout="centered" message="Đang tải danh sách yêu thích..." />
        </div>
      </Page>
    );
  }

  if (wishlist.length === 0) {
    return (
      <Page>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-neutral-9 mb-2">Sản phẩm đã thích</h1>
            <p className="text-neutral-6">Danh sách sản phẩm yêu thích của bạn</p>
          </div>
          <Empty
            variant="default"
            title="Chưa có sản phẩm yêu thích"
            description="Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Hãy khám phá và thêm các sản phẩm bạn thích!"
            action={
              <Button color="blue" variant="solid" onClick={() => navigate("/products")}>
                Khám phá sản phẩm
              </Button>
            }
          />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-9 mb-2">Sản phẩm đã thích</h1>
            <p className="text-neutral-6">{wishlist.length} sản phẩm trong danh sách yêu thích</p>
          </div>
          {wishlist.length > 0 && (
            <Button
              color="red"
              variant="outline"
              size="sm"
              onClick={() => setIsClearModalOpen(true)}
              disabled={wishlistStatus === ReduxStateType.LOADING}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Xóa tất cả
            </Button>
          )}
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {wishlist.map((item: WishlistItem) => {
            const product = wishlistItemToProduct(item);
            return (
              <div key={item.productId} className="relative">
                <ProductCard product={product} />
               
              </div>
            );
          })}
        </div>

        {/* Clear Modal */}
        <ConfirmModal
          open={isClearModalOpen}
          onOpenChange={setIsClearModalOpen}
          title="Xóa toàn bộ danh sách yêu thích"
          content="Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi danh sách yêu thích? Hành động này không thể hoàn tác."
          confirmText="Xóa tất cả"
          cancelText="Hủy"
          iconType="warning"
          onConfirm={handleClearWishlist}
          onCancel={() => setIsClearModalOpen(false)}
          disabled={wishlistStatus === ReduxStateType.LOADING}
        />
      </div>
    </Page>
  );
};

export default WishlistPage;
