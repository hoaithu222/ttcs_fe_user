import React from "react";
import { Category } from "@/core/api/categories/type";
import Image from "@/foundation/components/icons/Image";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import Empty from "@/foundation/components/empty/Empty";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";

interface CategoryListProps {
  categories: Category[];
  isLoading?: boolean;
  title?: string;
}

// Skeleton component for category loading
const CategorySkeleton: React.FC<{ count?: number; gridCols?: string }> = ({ 
  count = 8,
  gridCols = "grid-cols-3 md:grid-cols-4"
}) => {
  return (
    <div className={`grid ${gridCols} gap-4`}>
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

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  isLoading = false,
  title = "Danh mục sản phẩm",
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Section className="py-8">
        <SectionTitle className="text-center mb-4 text-2xl font-bold text-primary-6">{title}</SectionTitle>
        <CategorySkeleton count={8} />
      </Section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Section>
        <SectionTitle>{title}</SectionTitle>
        <Empty variant="data" title="Chưa có danh mục" description="Danh mục sẽ được hiển thị ở đây" />
      </Section>
    );
  }

  return (
    <Section className="py-8">
      <SectionTitle className="text-center mb-4 text-2xl font-bold text-primary-6">{title}</SectionTitle>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4 mt-4">
        {categories.map((category) => {
          const iconImage =
            (category as any).image_Icon?.url ||
            ((category as any).image && Array.isArray((category as any).image) && (category as any).image.length > 0
              ? (category as any).image[0].url
              : null);

          return (
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
                {iconImage ? (
                  <Image
                    src={iconImage}
                    alt={category.name}
                    className="w-full h-full"
                    objectFit="cover"
                    fallbackType="default"
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
          );
        })}
      </div>
    </Section>
  );
};

export default CategoryList;

