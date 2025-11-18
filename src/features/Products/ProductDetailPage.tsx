import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Home, Package, ShoppingCart } from "lucide-react";
import Page from "@/foundation/components/layout/Page";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import { ProductCard, DetailProduct, InfoShop, ContentProduct, ReviewProduct } from "./components";
import {
  getProductDetailStart,
  getRelatedProductsStart,
  getProductReviewsStart,
  clearProductDetail,
} from "./slices/product.slice";
import {
  selectProductDetail,
  selectProductDetailStatus,
  selectProductDetailError,
  selectRelatedProducts,
  selectProductReviews,
} from "./slices/product.selector";
import { ReduxStateType } from "@/app/store/types";
import { ProductVariant } from "@/core/api/products/type";
import { useAddToCart } from "@/features/Cart/hooks/useAddToCart";
import { addToast } from "@/app/store/slices/toast";
import { userWishlistApi } from "@/core/api/wishlist";
import { selectProfile } from "@/features/Profile/slice/profile.selector";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addToCart } = useAddToCart();

  const product = useSelector(selectProductDetail);
  const productStatus = useSelector(selectProductDetailStatus);
  const productError = useSelector(selectProductDetailError);
  const relatedProducts = useSelector(selectRelatedProducts);
  const reviews = useSelector(selectProductReviews);
  const profile = useSelector(selectProfile);

  const [quantity, setQuantity] = useState(1);
  const [isWishlist, setIsWishlist] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getProductDetailStart(id));
      dispatch(getRelatedProductsStart(id));
      dispatch(getProductReviewsStart({ productId: id }));
    }

    return () => {
      dispatch(clearProductDetail());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (product) {
      setIsWishlist(product.isInWishlist || false);
    }
  }, [product]);

  const requiresVariantSelection = useMemo(
    () => Boolean(product?.variants && product.variants.length > 0),
    [product?.variants]
  );

  const productShopId = useMemo(() => {
    if (!product) return "";
    if (typeof product.shopId === "string") return product.shopId;
    if (product.shop?._id) return product.shop._id;
    const fallback = (product as any)?.shopId?._id;
    return typeof fallback === "string" ? fallback : "";
  }, [product]);

  const userShopId = profile?.shop?.id;
  const isOwnShopProduct = useMemo(() => {
    if (!productShopId || !userShopId) return false;
    return productShopId === userShopId;
  }, [productShopId, userShopId]);

  const validateBeforePurchase = () => {
    if (isOwnShopProduct) {
      dispatch(
        addToast({
          type: "error",
          message: "Bạn không thể đặt sản phẩm thuộc cửa hàng của mình.",
        })
      );
      return false;
    }
    if (requiresVariantSelection && !selectedVariant) {
      dispatch(
        addToast({
          type: "error",
          message: "Vui lòng chọn biến thể trước khi tiếp tục.",
        })
      );
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!validateBeforePurchase()) return;
    addToCart(product, quantity, selectedVariant, { showToast: true });
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!validateBeforePurchase()) return;
    addToCart(product, quantity, selectedVariant, { showToast: true });
    navigate("/checkout");
  };

  const handleToggleWishlist = async () => {
    if (!product || wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (isWishlist) {
        await userWishlistApi.removeFromWishlist(product._id);
        setIsWishlist(false);
        dispatch(addToast({ type: "success", message: "Đã xóa khỏi danh sách yêu thích" }));
      } else {
        await userWishlistApi.addToWishlist(product._id);
        setIsWishlist(true);
        dispatch(addToast({ type: "success", message: "Đã thêm vào danh sách yêu thích" }));
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.";
      dispatch(addToast({ type: "error", message }));
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const currentStock = selectedVariant?.stock ?? product?.stock ?? 1;
    const newQuantity = Math.max(1, Math.min(quantity + delta, currentStock));
    setQuantity(newQuantity);
  };

  const handleVariantChange = (variant: ProductVariant | null) => {
    setSelectedVariant(variant);
    // Reset quantity to 1 when variant changes
    setQuantity(1);
  };

  const isLoading = productStatus === ReduxStateType.LOADING;
  const hasError = productStatus === ReduxStateType.ERROR;

  if (isLoading) {
    return (
      <Page>
        <div className="container mx-auto px-4 py-8">
          <Loading layout="centered" message="Đang tải thông tin sản phẩm..." />
        </div>
      </Page>
    );
  }

  if (hasError || !product) {
    return (
      <Page>
        <div className="container mx-auto px-4 py-8">
          <Empty
            variant="default"
            title="Không tìm thấy sản phẩm"
            description={productError || "Sản phẩm không tồn tại hoặc đã bị xóa"}
            action={
              <Button color="blue" variant="solid" onClick={() => navigate("/products")}>
                Quay lại danh sách
              </Button>
            }
          />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="min-h-screen bg-background-1">
        {/* Breadcrumb Navigation */}
        <div className="bg-background-2 border-b border-border-1">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
              <Link
                to="/"
                className="flex items-center gap-1 text-neutral-6 hover:text-primary-6 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Trang chủ</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-neutral-4" />
              <Link
                to="/products"
                className="text-neutral-6 hover:text-primary-6 transition-colors"
              >
                Sản phẩm
              </Link>
              {product.category && (
                <>
                  <ChevronRight className="w-4 h-4 text-neutral-4" />
                  <span className="text-neutral-6">{product.category.name}</span>
                </>
              )}
              {product.subCategory && (
                <>
                  <ChevronRight className="w-4 h-4 text-neutral-4" />
                  <span className="text-neutral-6">{product.subCategory.name}</span>
                </>
              )}
              <ChevronRight className="w-4 h-4 text-neutral-4" />
              <span className="text-neutral-9 font-medium truncate max-w-xs" title={product.name}>
                {product.name}
              </span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 lg:py-12">
          {/* Back Button - Desktop */}
          <div className="hidden md:block mb-6">
            <Button
              color="gray"
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              icon={<ChevronLeft className="w-4 h-4" />}
              className="hover:bg-neutral-2"
            >
              Quay lại
            </Button>
          </div>

          {/* Product Detail Section */}
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DetailProduct
              product={product}
              quantity={quantity}
              isWishlist={isWishlist}
              selectedVariant={selectedVariant}
              onQuantityChange={handleQuantityChange}
              onVariantChange={handleVariantChange}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onToggleWishlist={handleToggleWishlist}
              isWishlistLoading={wishlistLoading}
              isOwnShopProduct={isOwnShopProduct}
            />
          </div>

          {/* Shop Info Section */}
          {product.shop && (
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <InfoShop shop={product.shop} />
            </div>
          )}

          {/* Product Content/Description Section */}
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <ContentProduct product={product} />
          </div>

          {/* Reviews Section */}
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <ReviewProduct
              reviews={reviews}
              averageRating={product.rating}
              totalReviews={product.reviewCount}
            />
          </div>

          {/* Related Products Section */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
              <Section className="bg-background-2 rounded-2xl p-6 lg:p-8 shadow-sm border border-border-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-primary-6/10">
                    <Package className="w-5 h-5 text-primary-6" />
                  </div>
                  <SectionTitle className="!mb-0">Sản phẩm liên quan</SectionTitle>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.slice(0, 4).map((relatedProduct, index) => (
                    <div
                      key={relatedProduct._id}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                      style={{ animationDelay: `${(index + 1) * 100}ms` }}
                    >
                      <ProductCard product={relatedProduct} />
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}
        </div>

        {/* Sticky Mobile Action Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background-1 border-t border-border-1 shadow-lg p-4 safe-area-inset-bottom">
          <div className="container mx-auto flex gap-3">
            <Button
              color="blue"
              variant="solid"
              size="lg"
              fullWidth
              onClick={handleAddToCart}
              disabled={
                (selectedVariant?.stock ?? product.stock ?? 0) === 0 || isOwnShopProduct || wishlistLoading
              }
              icon={<ShoppingCart className="w-5 h-5" />}
              className="flex-1"
            >
              {isOwnShopProduct ? "Không thể mua sản phẩm của bạn" : "Thêm vào giỏ"}
            </Button>
            <Button
              color="green"
              variant="solid"
              size="lg"
              fullWidth
              onClick={handleBuyNow}
              disabled={(selectedVariant?.stock ?? product.stock ?? 0) === 0 || isOwnShopProduct}
              className="flex-1"
            >
              Mua ngay
            </Button>
          </div>
          {isOwnShopProduct && (
            <p className="mt-2 text-center text-xs text-warning">
              Sản phẩm thuộc cửa hàng của bạn nên không thể thêm vào giỏ.
            </p>
          )}
        </div>
      </div>
    </Page>
  );
};

export default ProductDetailPage;
