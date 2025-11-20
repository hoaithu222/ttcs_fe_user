import React from "react";
import { SubCategory } from "@/core/api/categories/type";
import Image from "@/foundation/components/icons/Image";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";

interface SubCategoryListProps {
  subCategories: SubCategory[];
  isLoading?: boolean;
  title?: string;
}

const SubCategoryList: React.FC<SubCategoryListProps> = ({
  subCategories,
  isLoading = false,
  title = "Danh mục con",
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Section>
        <SectionTitle>{title}</SectionTitle>
        <div className="flex justify-center items-center py-12">
          <Loading variant="spinner" />
        </div>
      </Section>
    );
  }

  if (!subCategories || subCategories.length === 0) {
    return null; // Don't show empty state for subcategories, just hide the section
  }

  return (
    <Section className="py-8">
      <SectionTitle className="text-center mb-4 text-2xl font-bold text-primary-6">{title}</SectionTitle>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {subCategories.map((subCategory) => {
          const iconImage =
            (subCategory as any).image_Icon?.url ||
            ((subCategory as any).image &&
            Array.isArray((subCategory as any).image) &&
            (subCategory as any).image.length > 0
              ? (subCategory as any).image[0].url
              : null);

          return (
            <div
              key={subCategory._id}
              onClick={() => navigate(`/categories/${subCategory._id}`)}
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
                    alt={subCategory.name}
                    className="w-full h-full"
                    objectFit="cover"
                    fallbackType="default"
                  />
                ) : (
                  <div className="flex justify-center items-center w-full h-full font-semibold text-white bg-primary-6">
                    {subCategory.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-center text-neutral-8 line-clamp-2">
                {subCategory.name}
              </span>
            </div>
          );
        })}
      </div>
    </Section>
  );
};

export default SubCategoryList;

