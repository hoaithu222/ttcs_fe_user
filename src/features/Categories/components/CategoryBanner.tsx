import React from "react";
import Image from "@/foundation/components/icons/Image";
import { Category } from "@/core/api/categories/type";
import Loading from "@/foundation/components/loading/Loading";

interface CategoryBannerProps {
  category: Category | null;
  isLoading?: boolean;
}

const CategoryBanner: React.FC<CategoryBannerProps> = ({ category, isLoading }) => {
  if (isLoading) {
    return (
      <div className="relative w-full h-64 md:h-80 lg:h-96 bg-neutral-2 rounded-lg overflow-hidden">
        <Loading variant="skeleton" layout="centered" />
      </div>
    );
  }

  if (!category) {
    return null;
  }

  // Get banner image - check image_Background first, then image array
  const bannerImage =
    (category as any).image_Background?.url ||
    ((category as any).image &&
    Array.isArray((category as any).image) &&
    (category as any).image.length > 0
      ? (category as any).image[0].url
      : null);

  if (!bannerImage) {
    return null;
  }

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg">
      <Image
        src={bannerImage}
        alt={category.name}
        className="w-full h-full"
        objectFit="cover"
        fallbackType="default"
      />
      {/* Overlay with category name */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
        <div className="w-full p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-sm md:text-base text-white/90 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryBanner;
