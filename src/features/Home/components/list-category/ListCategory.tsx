import React, { useMemo, useState } from "react";
import { useCategoryHome } from "../../hooks/useCategoryHome";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Image from "@/foundation/components/icons/Image";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Category as BaseCategory } from "@/core/api/categories/type";

// Extend base Category to reflect actual backend payload used by Home
interface MediaAsset {
  url: string;
  publicId: string;
  createdAt: string;
  updatedAt: string;
}

type HomeCategory = Omit<BaseCategory, "image" | "banner" | "sortOrder"> & {
  image?: MediaAsset[]; // backend can return an array for images
  image_Icon?: MediaAsset;
  image_Background?: MediaAsset;
  order_display?: number;
  sortOrder?: number;
  subCategories?: unknown[];
};

// Skeleton component for category loading
const CategorySkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 items-center p-4 rounded-lg bg-background-3"
        >
          <div 
            className="w-16 h-16 rounded-full bg-gradient-to-br from-neutral-3 via-neutral-2 to-neutral-3 animate-pulse"
            style={{ 
              animationDelay: `${index * 0.08}s`,
              animationDuration: "1.8s"
            }} 
          />
          <div className="flex flex-col gap-1.5 w-full">
            <div 
              className="h-3 bg-gradient-to-r from-neutral-3 via-neutral-2 to-neutral-3 rounded-md animate-pulse w-full"
              style={{ 
                animationDelay: `${index * 0.08 + 0.1}s`,
                animationDuration: "1.8s"
              }} 
            />
            <div 
              className="h-3 bg-gradient-to-r from-neutral-3 via-neutral-2 to-neutral-3 rounded-md animate-pulse w-3/4 mx-auto"
              style={{ 
                animationDelay: `${index * 0.08 + 0.2}s`,
                animationDuration: "1.8s"
              }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const PAGE_SIZE = 8;

const ListCategory: React.FC = () => {
  const [page, setPage] = useState(1);
  const { categories, isLoading, pagination } = useCategoryHome(page, PAGE_SIZE);
  const navigate = useNavigate();

  const total = pagination?.total ?? categories?.length ?? 0;
  const totalPages =
    pagination?.totalPages && pagination.totalPages > 0
      ? pagination.totalPages
      : Math.max(1, Math.ceil(total / PAGE_SIZE));

  const { displayFrom, displayTo } = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(start + PAGE_SIZE - 1, total || PAGE_SIZE);
    return {
      displayFrom: total === 0 ? 0 : start,
      displayTo: total === 0 ? 0 : end,
    };
  }, [page, total]);

  const handlePrev = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

  const disablePrev = page <= 1 || isLoading;
  const disableNext = page >= totalPages || isLoading;

  if (isLoading) {
    return (
      <Section className="py-6">
        <SectionTitle className="text-center mb-4 text-2xl font-bold text-primary-6">
          Danh mục sản phẩm
        </SectionTitle>
        <CategorySkeleton count={PAGE_SIZE} />
      </Section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }


  return (
    <Section className="py-6">
      <SectionTitle className="text-center mb-2 text-2xl font-bold text-primary-6">
        Danh mục sản phẩm
      </SectionTitle>
    
      <p className="sr-only" aria-live="polite">
        Trang {page} hiển thị danh mục {displayFrom}-{displayTo} trên tổng{" "}
        {total || categories.length}
      </p>
      <div className="relative">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {(categories as unknown as HomeCategory[]).map((category) => (
            <div
              key={category._id}
              onClick={() => navigate(`/categories/${category._id}`)}
              className={clsx(
                "flex flex-col gap-2 items-center p-4 rounded-lg",
                "cursor-pointer bg-background-3 hover:bg-background-2",
                "transition-all duration-200 hover:shadow-md"
              )}
            >
              <div className="flex overflow-hidden justify-center items-center w-16 h-16 rounded-full bg-neutral-2">
                {category.image ? (
                  <Image
                    src={category.image_Icon?.url || ""}
                    alt={category.name}
                    className="w-full h-full"
                    objectFit="cover"
                  />
                ) : (
                  <div className="flex justify-center items-center w-full h-full font-semibold text-white bg-primary-6">
                    {category.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-center text-neutral-8 line-clamp-2">
                {category.name}
              </span>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={disablePrev}
            className={clsx(
              "pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-neutral-9/90 text-white shadow-lg transition-all",
              disablePrev
                ? "cursor-not-allowed opacity-30"
                : "hover:-translate-x-1 hover:border-primary-5 hover:text-primary-5"
            )}
            aria-label="Trang trước"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={disableNext}
            className={clsx(
              "pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-neutral-9/90 text-white shadow-lg transition-all",
              disableNext
                ? "cursor-not-allowed opacity-30"
                : "hover:translate-x-1 hover:border-primary-5 hover:text-primary-5"
            )}
            aria-label="Trang tiếp theo"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Section>
  );
};

export default ListCategory;
