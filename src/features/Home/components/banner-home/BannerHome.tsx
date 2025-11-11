import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Truck, RefreshCw, Zap, Tag, Award } from "lucide-react";
import image01 from "@/assets/image/Banner/bndongho.jpg";
import image02 from "@/assets/image/Banner/gnam.jpg";
import image03 from "@/assets/image/Banner/tn.jpg";
import img1 from "@/assets/image/Banner/banner03.jpg";
import img2 from "@/assets/image/Banner/tainghe1.jpg";
import "./banner-home.css";

interface FeatureCardProps {
  feature: {
    icon: React.ReactNode;
    text: string;
    iconBg: string;
    hoverColor: string;
  };
  index: number;
  mounted: boolean;
}

const FeatureCard = ({ feature, index, mounted }: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`feature-card relative flex flex-col items-center gap-3 bg-background-1 p-4 rounded-xl shadow-md transition-all duration-300 border border-divider-1 ${
        mounted ? "animate-fade-in-up" : ""
      } ${isHovered ? "shadow-lg -translate-y-1" : ""}`}
      style={{ animationDelay: `${(index + 3) * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon Container */}
      <div className="relative z-10">
        <div
          className={`w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center transform transition-transform duration-300 shadow-md ${
            isHovered ? "scale-110" : ""
          }`}
        >
          <div className="text-neutral-0">{feature.icon}</div>
        </div>
      </div>

      {/* Text */}
      <p
        className={`relative z-10 text-xs lg:text-sm font-semibold transition-colors duration-300 text-center ${
          isHovered
            ? feature.hoverColor.replace("group-hover:", "").replace("hover:", "")
            : "text-neutral-7"
        }`}
      >
        {feature.text}
      </p>
    </div>
  );
};

const HomeBanner = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  const listImage = [image01, image02, image03];
  const sideImages = [img1, img2];

  const features = [
    {
      icon: <Check className="w-6 h-6 lg:w-8 lg:h-8" />,
      text: "100% hàng thật",
      gradient: "from-success/20 to-success/5",
      iconBg: "from-success to-success/80",
      iconColor: "text-success",
      hoverColor: "group-hover:text-success",
    },
    {
      icon: <Truck className="w-6 h-6 lg:w-8 lg:h-8" />,
      text: "Freeship mọi đơn",
      gradient: "from-primary-8/20 to-primary-8/5",
      iconBg: "from-primary-8 to-primary-7",
      iconColor: "text-primary-8",
      hoverColor: "group-hover:text-primary-7",
    },
    {
      icon: <RefreshCw className="w-6 h-6 lg:w-8 lg:h-8" />,
      text: "30 ngày đổi trả",
      gradient: "from-ceiling-price/20 to-ceiling-price/5",
      iconBg: "from-ceiling-price to-primary-8",
      iconColor: "text-ceiling-price",
      hoverColor: "group-hover:text-primary-8",
    },
    {
      icon: <Zap className="w-6 h-6 lg:w-8 lg:h-8" />,
      text: "Giao hàng nhanh",
      gradient: "from-highlight/20 to-highlight/5",
      iconBg: "from-highlight to-warning",
      iconColor: "text-highlight",
      hoverColor: "group-hover:text-warning",
    },
    {
      icon: <Tag className="w-6 h-6 lg:w-8 lg:h-8" />,
      text: "Giá siêu rẻ",
      gradient: "from-primary-8/20 to-primary-8/5",
      iconBg: "from-primary-8 to-primary-6",
      iconColor: "text-primary-8",
      hoverColor: "group-hover:text-primary-6",
    },
    {
      icon: <Award className="w-6 h-6 lg:w-8 lg:h-8" />,
      text: "Hàng chất lượng",
      gradient: "from-error/20 to-error/5",
      iconBg: "from-error to-down-price",
      iconColor: "text-error",
      hoverColor: "group-hover:text-down-price",
    },
  ];

  const nextImage = () => {
    if (!isAnimating && currentImage < listImage.length - 1) {
      setIsAnimating(true);
      setCurrentImage((prev) => prev + 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const prevImage = () => {
    if (!isAnimating && currentImage > 0) {
      setIsAnimating(true);
      setCurrentImage((prev) => prev - 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      if (currentImage >= listImage.length - 1) {
        setCurrentImage(0);
      } else {
        nextImage();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentImage]);

  return (
    <div className="py-4 overflow-x-hidden">
      <div className="bg-gradient-to-br from-background-base to-background-2 overflow-hidden rounded-3xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Carousel */}
          <div
            className={`relative h-[400px] lg:h-[500px] overflow-hidden rounded-3xl shadow-2xl ${
              mounted ? "animate-slide-in-left" : ""
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Decorative Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-8/10 via-transparent to-primary-6/10 pointer-events-none z-[5]" />

            {/* Navigation Buttons */}
            <div
              className={`absolute inset-0 z-10 flex items-center justify-between px-4 lg:px-6 transition-all duration-500 ${
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <button
                onClick={prevImage}
                disabled={currentImage === 0}
                className="group/btn p-3 lg:p-4 rounded-2xl bg-background-1/95 backdrop-blur-md hover:bg-background-1 shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-x-2 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed border border-divider-1 hover:border-primary-8 hover:shadow-primary-8/20"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 lg:w-7 lg:h-7 text-primary-8 group-hover/btn:text-primary-7 transition-colors" />
              </button>
              <button
                onClick={nextImage}
                disabled={currentImage === listImage.length - 1}
                className="group/btn p-3 lg:p-4 rounded-2xl bg-background-1/95 backdrop-blur-md hover:bg-background-1 shadow-2xl transition-all duration-300 transform hover:scale-110 hover:translate-x-2 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed border border-divider-1 hover:border-primary-8 hover:shadow-primary-8/20"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 lg:w-7 lg:h-7 text-primary-8 group-hover/btn:text-primary-7 transition-colors" />
              </button>
            </div>

            {/* Images with Enhanced Transitions */}
            <div className="relative h-full">
              {listImage.map((imageUrl, index) => (
                <div
                  key={`slide-${index}`}
                  className="absolute w-full h-full transition-all duration-1000 ease-out"
                  style={{
                    transform: `translateX(${(index - currentImage) * 100}%) scale(${
                      index === currentImage ? 1 : 0.95
                    })`,
                    opacity: index === currentImage ? 1 : 0,
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-overlay" />
                  {index === currentImage && (
                    <div className="absolute inset-0 shimmer-effect opacity-40" />
                  )}
                </div>
              ))}
            </div>

            {/* Enhanced Dots Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20 bg-background-1/20 backdrop-blur-md px-6 py-3 rounded-full border border-background-1/30">
              {listImage.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  onClick={() => setCurrentImage(index)}
                  className={`dot-indicator relative ${
                    currentImage === index
                      ? "w-12 h-3 bg-gradient-to-r from-primary-8 to-primary-6 rounded-full shadow-lg shadow-primary-8/30"
                      : "w-3 h-3 bg-background-1/60 rounded-full hover:bg-background-1 hover:scale-150"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {currentImage === index && (
                    <span className="absolute inset-0 rounded-full bg-background-1 animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            {/* Image Counter Badge */}
            <div className="absolute top-6 right-6 z-20 bg-overlay backdrop-blur-md text-neutral-0 px-4 py-2 rounded-full text-sm font-semibold border border-background-1/20 animate-slide-in-down">
              {currentImage + 1} / {listImage.length}
            </div>
          </div>

          {/* Side Images with Staggered Animation */}
          <div className="flex-col gap-6 hidden lg:flex">
            {sideImages.map((image, index) => (
              <div
                key={`side-${index}`}
                className={`relative h-[235px] overflow-hidden rounded-3xl shadow-xl group cursor-pointer ${
                  mounted ? "animate-slide-in-right" : ""
                }`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <img
                  src={image}
                  alt={`Side image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-overlay via-overlay/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Hover Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <div className="text-neutral-0">
                    <p className="text-sm font-medium opacity-80 mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                      Khám phá thêm
                    </p>
                    <div className="text-xl font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                      Xem chi tiết
                      <ChevronRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>

                {/* Corner Badge */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl glass-effect flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100 rotate-0 group-hover:rotate-12">
                  <ChevronRight className="w-6 h-6 text-neutral-0" />
                </div>

                {/* Shimmer Effect on Hover */}
                <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={`feature-${index}`}
              feature={feature}
              index={index}
              mounted={mounted}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeBanner;
