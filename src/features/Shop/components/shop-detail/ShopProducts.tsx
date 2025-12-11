import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import ProductCard from "@/features/Products/components/ProductCard";
import { userProductsApi } from "@/core/api/products";
import type { ShopProduct } from "@/core/api/shops/type";
import type { Product, ProductListQuery } from "@/core/api/products/type";
import clsx from "clsx";

interface ShopProductsProps {
  shopId: string;
  initialProducts?: ShopProduct[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const ShopProducts: React.FC<ShopProductsProps> = ({
  shopId,
  initialProducts = [],
  activeTab = "all",
  onTabChange,
}) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch products based on active tab
  useEffect(() => {
    const fetchProducts = async () => {
      if (!shopId) return;

      try {
        setLoading(true);
        // Use products API with shopId filter instead of shops API
        const query: ProductListQuery = {
          page: 1,
          limit: 50,
          shopId: shopId,
        };

        // Add filters based on active tab
        if (activeTab === "new") {
          query.sortBy = "createdAt";
          query.sortOrder = "desc";
        } else if (activeTab === "price-low") {
          query.sortBy = "price";
          query.sortOrder = "asc";
        } else if (activeTab === "price-high") {
          query.sortBy = "price";
          query.sortOrder = "desc";
        } else if (activeTab === "rating") {
          query.sortBy = "rating";
          query.sortOrder = "desc";
        }

        const response = await userProductsApi.getProducts(query);
        console.log("Shop products response:", response);
        
        // API returns data as array directly, or as object with products property
        const productsData = Array.isArray(response.data) 
          ? response.data 
          : response.data?.products || [];
        
        const paginationData = response.meta || response.data?.pagination;
        
        if (productsData && productsData.length > 0) {
          console.log(`Found ${productsData.length} products for shop ${shopId}`);
          setProducts(productsData);
          setHasMore(
            paginationData
              ? paginationData.page < paginationData.totalPages
              : false
          );
        } else {
          console.warn("No products in response:", response);
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch shop products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [shopId, activeTab]);

  // Initialize with recent products if available (convert ShopProduct to Product)
  useEffect(() => {
    if (initialProducts.length > 0 && products.length === 0 && !loading) {
      const convertedProducts: Product[] = initialProducts.map((shopProduct) => ({
        _id: shopProduct._id,
        name: shopProduct.name,
        description: shopProduct.description,
        images: shopProduct.images || [],
        price: shopProduct.price,
        discount: shopProduct.discount,
        finalPrice: shopProduct.finalPrice,
        stock: shopProduct.stock,
        rating: shopProduct.rating,
        reviewCount: shopProduct.reviewCount,
        salesCount: shopProduct.salesCount,
        isActive: shopProduct.isActive,
        createdAt: shopProduct.createdAt,
        updatedAt: shopProduct.createdAt,
        shop: {
          _id: shopId,
          name: "",
        },
      })) as Product[];
      setProducts(convertedProducts);
    }
  }, [initialProducts, shopId, products.length, loading]);

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "new", label: "Hàng mới về" },
    { id: "price-low", label: "Giá thấp đến cao" },
    { id: "price-high", label: "Giá cao đến thấp" },
    { id: "rating", label: "Đánh giá cao" },
  ];

  return (
    <div className="space-y-6 bg-background-1 border border-border-1 rounded-2xl p-5 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-neutral-9">Sản phẩm của cửa hàng</h2>
          <p className="text-sm text-neutral-6 text-nowrap text-start">
            {products.length > 0 ? `${products.length} sản phẩm đang hiển thị` : "Đang cập nhật sản phẩm"}
          </p>
        </div>
        <Button
          color="gray"
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/products?shopId=${shopId}`)}
          icon={<ChevronRight className="w-4 h-4" />}
          iconPosition="right"
        >
          Xem tất cả
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={clsx(
              "px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 rounded-t-md",
              activeTab === tab.id
                ? "border-primary-6 text-primary-6"
                : "border-transparent text-neutral-6 hover:text-neutral-9"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-12">
          <Loading layout="centered" message="Đang tải sản phẩm..." />
        </div>
      ) : products.length === 0 ? (
        <div className="py-12">
          <Empty
            variant="default"
            title="Chưa có sản phẩm"
            description="Cửa hàng chưa có sản phẩm nào"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopProducts;

