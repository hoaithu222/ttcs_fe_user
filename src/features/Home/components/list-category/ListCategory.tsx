import React from "react";
import { useCategoryHome } from "../../hooks/useCategoryHome";
import Spinner from "@/foundation/components/feedback/Spinner";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Image from "@/foundation/components/icons/Image";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
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

const ListCategory: React.FC = () => {
  const { categories, isLoading } = useCategoryHome(1, 12);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Section>
        <SectionTitle>Danh mục sản phẩm</SectionTitle>
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      </Section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  console.log("categories", categories);

  return (
    <Section className="py-12">
      <SectionTitle>Danh mục sản phẩm</SectionTitle>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
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
    </Section>
  );
};

export default ListCategory;
