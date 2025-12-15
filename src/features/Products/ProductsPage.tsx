import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, Filter, ChevronDown, Check } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import * as Slider from "@radix-ui/react-slider";
import Page from "@/foundation/components/layout/Page";
import Input from "@/foundation/components/input/Input"; // Giả sử component này nhận className
import Button from "@/foundation/components/buttons/Button";
import ListProduct from "./components/ListProduct";
import type { ProductListQuery } from "@/core/api/products/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Price range state
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 50000000,
  ]);

  const [filters, setFilters] = useState<ProductListQuery>({
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 20,
    search: searchParams.get("search") || undefined,
    categoryId: searchParams.get("categoryId") || undefined,
    subCategoryId: searchParams.get("subCategoryId") || undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    sortBy: (searchParams.get("sortBy") as ProductListQuery["sortBy"]) || undefined,
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || undefined,
    rating: searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined,
    inStock: searchParams.get("inStock") === "true" ? true : undefined,
  });

  // ... (Giữ nguyên phần logic useEffect update URL và các handlers ...)
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.page && filters.page > 1) params.set("page", filters.page.toString());
    if (filters.limit && filters.limit !== 20) params.set("limit", filters.limit.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.subCategoryId) params.set("subCategoryId", filters.subCategoryId);
    if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
    if (filters.rating) params.set("rating", filters.rating.toString());
    if (filters.inStock) params.set("inStock", "true");
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchQuery || undefined, page: 1 });
  };

  const handlePriceRangeChange = useCallback((values: number[]) => {
    setPriceRange([values[0], values[1]]);
  }, []);

  const handlePriceRangeCommit = useCallback((values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: values[0] > 0 ? values[0] : undefined,
      maxPrice: values[1] < 50000000 ? values[1] : undefined,
      page: 1,
    }));
  }, []);

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as ProductListQuery["sortBy"],
      page: 1,
    }));
  };

  const handleRatingFilter = (rating: number | undefined) => {
    setFilters((prev) => ({ ...prev, rating, page: 1 }));
  };

  const handleInStockToggle = () => {
    setFilters((prev) => ({ ...prev, inStock: !prev.inStock ? true : undefined, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 50000000]);
    setFilters({ page: 1, limit: 20 });
  };

  const hasActiveFilters =
    filters.search || filters.minPrice || filters.maxPrice || filters.sortBy || filters.rating || filters.inStock;

  // UI Component cho Active Tag (Chip)
  const FilterTag = ({ label, onRemove }: { label: React.ReactNode; onRemove?: () => void }) => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-primary-1 text-primary-7 rounded-full border border-primary-2 transition-colors hover:bg-primary-2">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-primary-9 focus:outline-none">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );

  return (
    <Page>
      <div className="min-h-screen bg-neutral-1/30">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          {/* Header & Search Section */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-9 tracking-tight">
                Danh sách sản phẩm
              </h1>
            </div>

            {/* Main Control Bar */}
            <div className="bg-background-1 rounded-2xl shadow-sm border border-border-1 p-4 md:p-5 sticky top-4 z-30 transition-shadow hover:shadow-md">
              <Form.Root onSubmit={handleSearch}>
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search Input - Chiếm phần lớn không gian */}
                  <div className="flex-1 relative group">
                    <Input
                      name="search"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      iconLeft={<Search className="w-5 h-5 text-neutral-4 group-hover:text-primary-6 transition-colors" />}
                      className="w-full !rounded-xl !border-neutral-2 focus:!border-primary-5 !bg-neutral-1/20 transition-all h-12"
                    />
                  </div>

                  {/* Buttons Action */}
                  <div className="flex gap-3 shrink-0">
                    <Button
                      type="submit"
                      color="blue"
                      variant="solid"
                      className="!rounded-xl px-6 h-12 shadow-primary-6/20 shadow-lg hover:shadow-primary-6/30 transition-all"
                    >
                      Tìm kiếm
                    </Button>
                    <Button
                      type="button"
                      color={showAdvancedFilters ? "blue" : "gray"}
                      variant="outline"
                     
                      icon={<SlidersHorizontal className="w-5 h-5 text-neutral-8" />}
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                      <span className="text-neutral-8">Bộ lọc</span>
                    </Button>
                  </div>
                </div>
              </Form.Root>

              {/* Advanced Filters Expandable Panel */}
              <div
                className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                  showAdvancedFilters ? "grid-rows-[1fr] opacity-100 mt-6 pt-6 border-t border-dashed border-neutral-2" : "grid-rows-[0fr] opacity-0 h-0"
                }`}
              >
                <div className="min-h-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    
                    {/* Column 1: Price Range */}
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-neutral-8 flex items-center gap-2">
                        Khoảng giá (VND)
                      </label>
                      <div className="px-1 pt-2 pb-6">
                        <Slider.Root
                          className="relative flex items-center select-none touch-none w-full h-5"
                          value={priceRange}
                          onValueChange={handlePriceRangeChange}
                          onValueCommit={handlePriceRangeCommit}
                          max={50000000}
                          step={100000}
                          minStepsBetweenThumbs={1}
                        >
                          <Slider.Track className="bg-neutral-2 relative grow rounded-full h-[4px]">
                            <Slider.Range className="absolute bg-primary-6 rounded-full h-full" />
                          </Slider.Track>
                          <Slider.Thumb
                            className="block w-5 h-5 bg-background-1 border-[3px] border-primary-6 rounded-full hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-1 shadow-md transition-transform cursor-pointer"
                          />
                          <Slider.Thumb
                            className="block w-5 h-5 bg-background-1 border-[3px] border-primary-6 rounded-full hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-1 shadow-md transition-transform cursor-pointer"
                          />
                        </Slider.Root>
                        <div className="flex justify-between items-center mt-2 text-sm font-medium text-neutral-7">
                          <span>{formatPriceVND(priceRange[0])}</span>
                          <span>{formatPriceVND(priceRange[1])}</span>
                        </div>
                      </div>
                      {/* Quick Price Pills */}
                      <div className="flex flex-wrap gap-2">
                        {[
                           { label: "< 1M", range: [0, 1000000] },
                           { label: "1M-5M", range: [1000000, 5000000] },
                           { label: "> 10M", range: [10000000, 50000000] }
                        ].map((item, idx) => (
                             <button
                                key={idx}
                                type="button"
                                onClick={() => handlePriceRangeCommit(item.range)}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-2 bg-neutral-1 hover:bg-white hover:border-primary-4 hover:text-primary-7 transition-colors"
                             >
                                {item.label}
                             </button>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Sorting */}
                    <div className="space-y-4">
                       <label className="text-sm font-semibold bg-background-1 text-neutral-8">Sắp xếp</label>
                       <div className="space-y-3">
                         <div className="relative">
                           <select
                             value={filters.sortBy || ""}
                             onChange={(e) => handleSortChange(e.target.value)}
                             className="w-full bg-background-1 pl-4 pr-10 py-2.5 text-sm border border-neutral-2 rounded-xl text-neutral-9 focus:outline-none focus:ring-2 focus:ring-primary-5/50 focus:border-primary-5 appearance-none cursor-pointer transition-all hover:bg-background-1"
                           >
                              <option value="">Mặc định</option>
                              <option value="createdAt">Mới nhất</option>
                              <option value="price">Giá bán</option>
                              <option value="salesCount">Bán chạy nhất</option>
                              <option value="viewCount">Lượt xem</option>
                           </select>
                           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-5 pointer-events-none" />
                         </div>
                         
                         {filters.sortBy && filters.sortBy !== "createdAt" && (
                            <div className="flex gap-2 bg-neutral-1 p-1 rounded-lg border border-neutral-2">
                               <button
                                 type="button"
                                 onClick={() => setFilters(prev => ({...prev, sortOrder: 'asc'}))}
                                 className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filters.sortOrder === 'asc' ? 'bg-white shadow-sm text-primary-7' : 'text-neutral-5 hover:text-neutral-7'}`}
                               >
                                 Tăng dần
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setFilters(prev => ({...prev, sortOrder: 'desc'}))}
                                 className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filters.sortOrder === 'desc' || !filters.sortOrder ? 'bg-white shadow-sm text-primary-7' : 'text-neutral-5 hover:text-neutral-7'}`}
                               >
                                 Giảm dần
                               </button>
                            </div>
                         )}
                       </div>
                    </div>

                    {/* Column 3: Rating */}
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-neutral-8">Đánh giá</label>
                      <div className="flex flex-col gap-2">
                        {[5, 4, 3].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleRatingFilter(filters.rating === rating ? undefined : rating)}
                            className={`flex items-center justify-between px-4 py-2 text-sm rounded-xl border transition-all duration-200 ${
                              filters.rating === rating
                                ? "border-primary-5 bg-primary-1/50 text-primary-8 shadow-sm"
                                : "border-transparent bg-background-1/50 hover:bg-background-1 hover:border-neutral-2 text-neutral-6"
                            }`}
                          >
                            <span className="flex items-center gap-1 font-medium">
                               {rating} <span className="text-yellow-500">★</span> trở lên
                            </span>
                            {filters.rating === rating && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Column 4: Status */}
                    <div className="space-y-4">
                       <label className="text-sm font-semibold bg-background-1 text-neutral-8">Trạng thái</label>
                       <label className={`flex bg-background-1 items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${filters.inStock ? 'border-primary-5 bg-primary-1/30' : 'border-neutral-2 bg-background-1 hover:border-primary-3'}`}>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${filters.inStock ? 'bg-primary-6 border-primary-6' : 'border-neutral-4 bg-background-1'}`}>
                             {filters.inStock && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <input
                            type="checkbox"
                            checked={filters.inStock || false}
                            onChange={handleInStockToggle}
                            className="hidden "
                          />
                          <span className={`text-sm font-medium ${filters.inStock ? 'text-primary-9' : 'text-neutral-7'}`}>Chỉ hiển thị còn hàng</span>
                       </label>
                       
                       {/* Reset Button */}
                       {hasActiveFilters && (
                           <div className="pt-4 mt-4 border-t border-neutral-2 lg:border-none lg:pt-0 lg:mt-0">
                               <Button
                                  variant="ghost"
                                  color="red"
                                  className="w-full justify-start !px-0 hover:bg-transparent hover:underline text-red-500"
                                  onClick={handleResetFilters}
                                  icon={<X className="w-4 h-4" />}
                                >
                                  Xóa bộ lọc
                               </Button>
                           </div>
                       )}
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters Display Section */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2 text-sm text-neutral-5 mr-1">
                   <Filter className="w-4 h-4" />
                   <span className="font-medium">Đang lọc:</span>
                </div>
                
                {filters.search && (
                   <FilterTag label={`Từ khóa: "${filters.search}"`} onRemove={() => setFilters({...filters, search: undefined})} />
                )}
                {(filters.minPrice || filters.maxPrice) && (
                   <FilterTag 
                      label={`Giá: ${formatPriceVND(filters.minPrice || 0)} - ${formatPriceVND(filters.maxPrice || 50000000)}`} 
                      onRemove={() => {
                        setPriceRange([0, 50000000]);
                        setFilters({...filters, minPrice: undefined, maxPrice: undefined});
                      }}
                   />
                )}
                {filters.sortBy && (
                   <FilterTag 
                      label={`Sắp xếp: ${filters.sortBy === "createdAt" ? "Mới nhất" : filters.sortBy === "price" ? "Giá" : filters.sortBy}`} 
                      onRemove={() => setFilters({...filters, sortBy: undefined})} 
                   />
                )}
                {filters.rating && (
                   <FilterTag label={`${filters.rating}★+`} onRemove={() => setFilters({...filters, rating: undefined})} />
                )}
                {filters.inStock && (
                   <FilterTag label="Còn hàng" onRemove={() => setFilters({...filters, inStock: undefined})} />
                )}
                
                <button 
                  onClick={handleResetFilters}
                  className="text-xs text-neutral-5 hover:text-primary-6 hover:underline underline-offset-2 ml-2 transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>

          {/* Products List Area */}
          <div className="bg-background-1 rounded-2xl shadow-sm border border-border-1 p-6 min-h-[400px]">
             {/* Thêm key để React mount lại component khi filters thay đổi sâu nếu cần, hoặc giữ nguyên logic hiện tại */}
             <ListProduct initialFilters={filters} showFilters={false} />
          </div>

        </div>
      </div>
    </Page>
  );
};

export default ProductsPage;