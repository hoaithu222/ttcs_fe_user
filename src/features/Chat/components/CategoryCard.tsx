import React from "react";
import { Folder, Package } from "lucide-react";
import Image from "@/foundation/components/icons/Image";
import { useNavigate } from "react-router-dom";

interface CategoryCardProps {
  categoryId?: string;
  categoryName?: string;
  categoryImage?: string;
  categoryDescription?: string;
  productCount?: number;
  slug?: string;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  categoryId,
  categoryName,
  categoryImage,
  categoryDescription,
  productCount,
  slug,
  className = "",
}) => {
  const navigate = useNavigate();

  if (!categoryId || !categoryName) return null;

  const handleClick = () => {
    if (slug) {
      navigate(`/categories/${slug}`);
    } else if (categoryId) {
      navigate(`/categories/${categoryId}`);
    }
  };

  return (
    <div
      className={`bg-background-2 rounded-lg border border-neutral-3 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="flex gap-3 p-3">
        {/* Category Image */}
        {categoryImage ? (
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-2 flex-shrink-0">
            <Image
              src={categoryImage}
              alt={categoryName}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary-5 to-primary-7 flex items-center justify-center flex-shrink-0">
            <Folder className="w-8 h-8 text-white" />
          </div>
        )}

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <Folder className="w-4 h-4 text-primary-6 flex-shrink-0 mt-0.5" />
            <h4 className="text-sm font-semibold text-neutral-10 line-clamp-2 hover:text-primary-6 transition-colors">
              {categoryName}
            </h4>
          </div>

          {/* Description */}
          {categoryDescription && (
            <p className="text-xs text-neutral-7 line-clamp-2 mt-1">
              {categoryDescription}
            </p>
          )}

          {/* Product Count */}
          {productCount !== undefined && productCount > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-6">
              <Package className="w-3 h-3" />
              <span>{productCount} sản phẩm</span>
            </div>
          )}

          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-6">
            <span>Xem danh mục</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;

