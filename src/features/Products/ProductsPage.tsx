import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import Page from "@/foundation/components/layout/Page";
import Section from "@/foundation/components/sections/Section";
import Input from "@/foundation/components/input/Input";
import ListProduct from "./components/ListProduct";
import VisualSearchSection from "./components/VisualSearchSection";
import type { ProductListQuery } from "@/core/api/products/type";

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
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
  });

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (filters.page) params.set("page", filters.page.toString());
    if (filters.limit) params.set("limit", filters.limit.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.subCategoryId) params.set("subCategoryId", filters.subCategoryId);
    if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchQuery || undefined, page: 1 });
  };

  return (
    <Page>
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <Section className="mb-6">
          <Form.Root onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                name="search"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                iconLeft={<Search className="w-5 h-5 text-neutral-5" />}
                sizeInput="lg"
              />
            </div>
          </Form.Root>
        </Section>

        <VisualSearchSection />

        {/* Products List */}
        <ListProduct initialFilters={filters} showFilters={true} />
      </div>
    </Page>
  );
};

export default ProductsPage;
