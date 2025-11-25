import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

interface ProductCarouselProps {
  products: Array<{
    productId?: string;
    productName?: string;
    productImage?: string;
    productPrice?: number;
    shopId?: string;
    shopName?: string;
  }>;
  className?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  className = "",
}) => {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const cardWidth = 320; // Approximate card width with gap
    const scrollAmount = cardWidth;

    const newPosition =
      direction === "left"
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(
            container.scrollWidth - container.clientWidth,
            scrollPosition + scrollAmount
          );

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setScrollPosition(newPosition);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight =
    scrollContainerRef.current &&
    scrollPosition <
      scrollContainerRef.current.scrollWidth -
        scrollContainerRef.current.clientWidth -
        10;

  return (
    <div className={`relative ${className}`}>
      {/* Scroll Buttons */}
      {products.length > 2 && (
        <>
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-lg border border-neutral-3 flex items-center justify-center hover:bg-neutral-1 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-8" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-lg border border-neutral-3 flex items-center justify-center hover:bg-neutral-1 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-neutral-8" />
            </button>
          )}
        </>
      )}

      {/* Products Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {products.map((product, index) => (
          <div
            key={product.productId || index}
            className="flex-shrink-0 w-[300px]"
          >
            <ProductCard
              productId={product.productId}
              productName={product.productName}
              productImage={product.productImage}
              productPrice={product.productPrice}
              shopId={product.shopId}
              shopName={product.shopName}
              showActions={true}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductCarousel;

