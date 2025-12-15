import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Grid, List } from "lucide-react";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import Button from "@/foundation/components/buttons/Button";
import Empty from "@/foundation/components/empty/Empty";
import { getProductsStart } from "@/features/Products/slices/product.slice";
import {
  selectProducts,
  selectProductsStatus,
  selectProductsError,
} from "@/features/Products/slices/product.selector";
import { ReduxStateType } from "@/app/store/types";
import type { ProductListQuery } from "@/core/api/products/type";

// Product Skeleton Component
const ProductSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col h-full overflow-hidden rounded-lg bg-background-dialog border border-border-1"
        >
          {/* Image Skeleton */}
          <div className="relative w-full aspect-square bg-neutral-2 animate-pulse" />
          
          {/* Content Skeleton */}
          <div className="flex flex-1 flex-col p-3 gap-2">
            {/* Name */}
            <div className="h-4 bg-gradient-to-r from-neutral-3 via-neutral-2 to-neutral-3 rounded animate-pulse"
              style={{ 
                animationDelay: `${index * 0.05}s`,
                animationDuration: "1.8s"
              }} 
            />
            <div className="h-4 bg-gradient-to-r from-neutral-3 via-neutral-2 to-neutral-3 rounded w-4/5 animate-pulse"
              style={{ 
                animationDelay: `${index * 0.05 + 0.1}s`,
                animationDuration: "1.8s"
              }} 
            />
            
            {/* Shop */}
            <div className="flex items-center gap-1.5 mt-1">
              <div className="h-4 w-4 rounded-full bg-neutral-3 animate-pulse" />
              <div className="h-3 bg-gradient-to-r from-neutral-3 via-neutral-2 to-neutral-3 rounded w-20 animate-pulse"
                style={{ 
                  animationDelay: `${index * 0.05 + 0.15}s`,
                  animationDuration: "1.8s"
                }} 
              />
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mt-1">
              <div className="h-3 w-12 bg-neutral-3 rounded animate-pulse" />
            </div>
            
            {/* Price */}
            <div className="flex items-baseline gap-2 mt-2">
              <div className="h-6 w-24 bg-gradient-to-r from-neutral-3 via-neutral-2 to-neutral-3 rounded animate-pulse"
                style={{ 
                  animationDelay: `${index * 0.05 + 0.2}s`,
                  animationDuration: "1.8s"
                }} 
              />
              <div className="h-4 w-16 bg-neutral-3 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface ListProductProps {
  initialFilters?: ProductListQuery;
  showFilters?: boolean;
  className?: string;
  onFiltersChange?: (filters: ProductListQuery) => void;
}

const ListProduct: React.FC<ListProductProps> = ({
  initialFilters = {},
  showFilters = true,
  className = "",
  onFiltersChange,
}) => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const status = useSelector(selectProductsStatus);
  const error = useSelector(selectProductsError);

  const [filters, setFilters] = useState<ProductListQuery>({
    page: 1,
    limit: 20,
    ...initialFilters,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Update local filters when initialFilters change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      ...initialFilters,
    }));
  }, [initialFilters]);

  useEffect(() => {
    dispatch(getProductsStart(filters));
  }, [dispatch, filters]);

  const handleFiltersChange = (newFilters: ProductListQuery) => {
    const updatedFilters = { ...newFilters, page: 1 };
    setFilters(updatedFilters);
    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
  };

  const handleResetFilters = () => {
    const resetFilters: ProductListQuery = {
      page: 1,
      limit: filters.limit || 20,
    };
    setFilters(resetFilters);
  };

  const isLoading = status === ReduxStateType.LOADING;
  const isEmpty = !isLoading && (!products || products.length === 0);

  return (
    <div className={className}>
      {/* Header with View Toggle */}
      <div className="flex gap-4 items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-9">Danh sách sản phẩm</h2>
          {products && products.length > 0 && (
            <p className="text-sm text-neutral-6 mt-1 text-start">Tìm thấy {products.length} sản phẩm</p>
          )}
        </div>
        {/* <div className="flex gap-2">
          <Button
            color={viewMode === "grid" ? "blue" : "gray"}
            variant={viewMode === "grid" ? "solid" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            icon={<Grid className="w-4 h-4" />}
          >
            Lưới
          </Button>
          <Button
            color={viewMode === "list" ? "blue" : "gray"}
            variant={viewMode === "list" ? "solid" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            icon={<List className="w-4 h-4" />}
          >
            Danh sách
          </Button>
        </div> */}
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="hidden lg:block w-64 flex-shrink-0">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Products Grid/List */}
        <div className="flex-1">
          {isLoading ? (
            <ProductSkeleton count={12} />
          ) : error ? (
            <Empty variant="default" title="Lỗi tải dữ liệu" description={error || undefined} />
          ) : isEmpty ? (
            <Empty
              variant="data"
              title="Không tìm thấy sản phẩm"
              description="Thử thay đổi bộ lọc để tìm thêm sản phẩm"
            />
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {products?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListProduct;
