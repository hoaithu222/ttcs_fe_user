import React, { useState } from "react";
import { X, Filter } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import type { ProductListQuery } from "@/core/api/products/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";

interface ProductFiltersProps {
  filters: ProductListQuery;
  onFiltersChange: (filters: ProductListQuery) => void;
  onReset: () => void;
  priceRange?: { min: number; max: number };
  className?: string;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  priceRange,
  className = "",
}) => {
  const [localFilters, setLocalFilters] = useState<ProductListQuery>(filters);
  const [priceValues, setPriceValues] = useState<number[]>([
    filters.minPrice || priceRange?.min || 0,
    filters.maxPrice || priceRange?.max || 10000000,
  ]);

  const handleFilterChange = (key: keyof ProductListQuery, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceChange = (values: number[]) => {
    setPriceValues(values);
    handleFilterChange("minPrice", values[0]);
    handleFilterChange("maxPrice", values[1]);
  };

  const handleReset = () => {
    const resetFilters: ProductListQuery = {
      page: 1,
      limit: filters.limit || 20,
    };
    setLocalFilters(resetFilters);
    setPriceValues([priceRange?.min || 0, priceRange?.max || 10000000]);
    onReset();
  };

  const hasActiveFilters =
    localFilters.categoryId ||
    localFilters.subCategoryId ||
    localFilters.minPrice ||
    localFilters.maxPrice ||
    localFilters.rating ||
    localFilters.sortBy;

  return (
    <Section className={className}>
      <div className="flex gap-4 items-center justify-between mb-4">
        <SectionTitle className="mb-0">
          <div className="flex gap-2 items-center">
            <Filter className="w-5 h-5" />
            <span>Bộ lọc</span>
          </div>
        </SectionTitle>
        {hasActiveFilters && (
          <Button
            color="gray"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            icon={<X className="w-4 h-4" />}
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <label className="block mb-2 text-sm font-medium text-neutral-9">Khoảng giá</label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                value={priceValues[0]}
                onChange={(e) => {
                  const newValues = [Number(e.target.value), priceValues[1]];
                  handlePriceChange(newValues);
                }}
                min={priceRange?.min || 0}
                max={priceRange?.max || 10000000}
                className="flex-1 px-3 py-2 text-sm border border-border-1 rounded-lg bg-background-1 text-neutral-9 focus:outline-none focus:ring-2 focus:ring-primary-6"
                placeholder="Từ"
              />
              <input
                type="number"
                value={priceValues[1]}
                onChange={(e) => {
                  const newValues = [priceValues[0], Number(e.target.value)];
                  handlePriceChange(newValues);
                }}
                min={priceRange?.min || 0}
                max={priceRange?.max || 10000000}
                className="flex-1 px-3 py-2 text-sm border border-border-1 rounded-lg bg-background-1 text-neutral-9 focus:outline-none focus:ring-2 focus:ring-primary-6"
                placeholder="Đến"
              />
            </div>
            <div className="flex gap-2 justify-between text-xs text-neutral-6">
              <span>{formatPriceVND(priceValues[0])}</span>
              <span>{formatPriceVND(priceValues[1])}</span>
            </div>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block mb-2 text-sm font-medium text-neutral-9">Sắp xếp theo</label>
          <select
            value={localFilters.sortBy || ""}
            onChange={(e) => handleFilterChange("sortBy", e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-border-1 rounded-lg bg-background-1 text-neutral-9 focus:outline-none focus:ring-2 focus:ring-primary-6"
          >
            <option value="">Mặc định</option>
            <option value="createdAt">Mới nhất</option>
            <option value="price">Giá</option>
            <option value="rating">Đánh giá</option>
            <option value="salesCount">Bán chạy</option>
            <option value="viewCount">Xem nhiều</option>
          </select>
        </div>

        {/* Sort Order */}
        {localFilters.sortBy && (
          <div>
            <label className="block mb-2 text-sm font-medium text-neutral-9">Thứ tự</label>
            <select
              value={localFilters.sortOrder || "desc"}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value as "asc" | "desc")}
              className="w-full px-3 py-2 text-sm border border-border-1 rounded-lg bg-background-1 text-neutral-9 focus:outline-none focus:ring-2 focus:ring-primary-6"
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>
        )}

        {/* Rating Filter */}
        <div>
          <label className="block mb-2 text-sm font-medium text-neutral-9">Đánh giá từ</label>
          <select
            value={localFilters.rating || ""}
            onChange={(e) =>
              handleFilterChange("rating", e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 text-sm border border-border-1 rounded-lg bg-background-1 text-neutral-9 focus:outline-none focus:ring-2 focus:ring-primary-6"
          >
            <option value="">Tất cả</option>
            <option value="4">4 sao trở lên</option>
            <option value="3">3 sao trở lên</option>
            <option value="2">2 sao trở lên</option>
            <option value="1">1 sao trở lên</option>
          </select>
        </div>

        {/* In Stock Filter */}
        <div>
          <label className="flex gap-2 items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.inStock || false}
              onChange={(e) => handleFilterChange("inStock", e.target.checked || undefined)}
              className="w-4 h-4 text-primary-6 border-border-1 rounded focus:ring-primary-6"
            />
            <span className="text-sm text-neutral-9">Chỉ hiển thị còn hàng</span>
          </label>
        </div>
      </div>
    </Section>
  );
};

export default ProductFilters;
