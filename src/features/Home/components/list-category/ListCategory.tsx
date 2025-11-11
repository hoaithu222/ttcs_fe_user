import React from "react";
import { useCategoryHome } from "../../hooks/useCategoryHome";
import Spinner from "@/foundation/components/feedback/Spinner";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Image from "@/foundation/components/icons/Image";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

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

  return (
    <Section>
      <SectionTitle>Danh mục sản phẩm</SectionTitle>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {categories.map((category) => (
          <div
            key={category._id}
            onClick={() => navigate(`/categories/${category._id}`)}
            className={clsx(
              "flex flex-col items-center gap-2 p-4 rounded-lg",
              "bg-background-3 hover:bg-background-2 cursor-pointer",
              "transition-all duration-200 hover:shadow-md"
            )}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-2 flex items-center justify-center">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full"
                  objectFit="cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-6 flex items-center justify-center text-white font-semibold">
                  {category.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-xs text-center text-neutral-8 font-medium line-clamp-2">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default ListCategory;

