import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ShopCard from "./ShopCard";

interface ShopCarouselProps {
  shops: Array<{
    shopId?: string;
    shopName?: string;
    shopLogo?: string;
    shopDescription?: string;
    rating?: number;
    followCount?: number;
    productCount?: number;
    reviewCount?: number;
    isVerified?: boolean;
  }>;
  className?: string;
}

const ShopCarousel: React.FC<ShopCarouselProps> = ({
  shops,
  className = "",
}) => {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  if (!shops || shops.length === 0) return null;

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
      {shops.length > 2 && (
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

      {/* Shops Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {shops.map((shop, index) => (
          <div
            key={shop.shopId || index}
            className="flex-shrink-0 w-[300px]"
          >
            <ShopCard
              shopId={shop.shopId}
              shopName={shop.shopName}
              shopLogo={shop.shopLogo}
              shopDescription={shop.shopDescription}
              rating={shop.rating}
              followCount={shop.followCount}
              productCount={shop.productCount}
              reviewCount={shop.reviewCount}
              isVerified={shop.isVerified}
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

export default ShopCarousel;

