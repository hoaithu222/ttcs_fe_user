import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Truck, RefreshCw, Zap, Tag, Award } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useNavigate } from "react-router-dom";
import { homeApi } from "@/core/api/home";
import "./banner-home.css";

// Icon mapping from string to React component
const iconMap: Record<string, React.ComponentType<any>> = {
  Check,
  Truck,
  RefreshCw,
  Zap,
  Tag,
  Award,
};

interface FeatureCardProps {
  feature: {
    icon: React.ReactNode;
    text: string;
    iconBg: string;
    hoverColor: string;
  };
}

const FeatureCard = ({ feature }: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative flex flex-col items-center gap-3 bg-background-1 p-4 rounded-xl shadow-md transition-all duration-300 border border-divider-1 ${
        isHovered ? "shadow-lg -translate-y-1" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon Container */}
      <div className="relative z-10">
        <div
          className={`w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center transition-transform duration-300 shadow-md ${
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
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mainBanners, setMainBanners] = useState<Array<{
    _id: string;
    image: { url: string; publicId?: string };
    title?: string;
    description?: string;
    link?: string;
  }>>([]);
  const [sideBanners, setSideBanners] = useState<Array<{
    _id: string;
    categoryId: string;
    category?: { _id: string; name: string };
    image?: { url: string; publicId?: string };
  }>>([]);
  const [features, setFeatures] = useState<Array<{
    icon: string;
    text: string;
    iconBg: string;
    hoverColor: string;
  }>>([]);
  const [settings, setSettings] = useState({
    autoSlideInterval: 5000,
    showCounter: true,
    showDots: true,
  });

  // Fetch banner data from API (only active configuration)
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const response = await homeApi.getBanner();
        if (response.success && response.data) {
          setMainBanners(response.data.mainBanners || []);
          setSideBanners(response.data.sideBanners || []);
          setFeatures(response.data.features || []);
          setSettings(response.data.settings || {
            autoSlideInterval: 5000,
            showCounter: true,
            showDots: true,
          });
        }
      } catch (error) {
        console.error("Error fetching banner data:", error);
      }
    };

    fetchBannerData();
  }, []);

  // Get icon component from string
  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName] || (LucideIcons as any)[iconName] || Check;
    return <IconComponent className="w-6 h-6 lg:w-8 lg:h-8" />;
  };

  const nextImage = () => {
    if (!isAnimating && currentImage < mainBanners.length - 1) {
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
    if (mainBanners.length === 0) return;
    
    const interval = setInterval(() => {
      if (currentImage >= mainBanners.length - 1) {
        setCurrentImage(0);
      } else {
        nextImage();
      }
    }, settings.autoSlideInterval);

    return () => clearInterval(interval);
  }, [currentImage, mainBanners.length, settings.autoSlideInterval]);

  const handleSideBannerClick = (categoryId: string) => {
    navigate(`/categories/${categoryId}`);
  };

  return (
    <div className="py-4 overflow-x-hidden">
      <div className=" overflow-hidden rounded-xl ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Main Carousel */}
          <div
            className="relative h-[400px] lg:h-[500px] overflow-hidden rounded-xl shadow-md"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
           

            {/* Navigation Buttons */}
            <div
              className={`absolute inset-0 z-10 flex items-center justify-between px-4 lg:px-6 transition-all duration-500 ${
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <button
                onClick={prevImage}
                disabled={currentImage === 0 || mainBanners.length === 0}
                className="group/btn p-3 lg:p-4 rounded-2xl bg-background-1/95 backdrop-blur-md hover:bg-background-1 shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-x-2 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed border border-divider-1 hover:border-primary-8 hover:shadow-primary-8/20"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 lg:w-7 lg:h-7 text-primary-8 group-hover/btn:text-primary-7 transition-colors" />
              </button>
              <button
                onClick={nextImage}
                disabled={currentImage === mainBanners.length - 1 || mainBanners.length === 0}
                className="group/btn p-3 lg:p-4 rounded-2xl bg-background-1/95 backdrop-blur-md hover:bg-background-1 shadow-2xl transition-all duration-300 transform hover:scale-110 hover:translate-x-2 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed border border-divider-1 hover:border-primary-8 hover:shadow-primary-8/20"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 lg:w-7 lg:h-7 text-primary-8 group-hover/btn:text-primary-7 transition-colors" />
              </button>
            </div>

            {/* Images with Enhanced Transitions */}
            <div className="relative h-full">
              {mainBanners.length > 0 ? (
                mainBanners.map((banner, index) => (
                  <div
                    key={banner._id || `slide-${index}`}
                    className="absolute w-full h-full transition-all duration-500 ease-out"
                    style={{
                      transform: `translateX(${(index - currentImage) * 100}%)`,
                      opacity: index === currentImage ? 1 : 0,
                    }}
                  >
                    <img
                      src={banner.image?.url || ""}
                      alt={banner.title || `Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                   
                  </div>
                ))
              ) : (
                <div className="w-full h-full bg-neutral-2 flex items-center justify-center">
                  <p className="text-neutral-6">Chưa có banner</p>
                </div>
              )}
            </div>

            {/* Enhanced Dots Indicator */}
            {settings.showDots && mainBanners.length > 0 && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-3 z-20 bg-background-1/20 backdrop-blur-md px-6 py-3 rounded-full border border-background-1/30">
                {mainBanners.map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    onClick={() => setCurrentImage(index)}
                    className={`transition-all duration-300 ${
                      currentImage === index
                        ? "w-12 h-3 bg-primary-8 rounded-full shadow-lg"
                        : "w-3 h-3 bg-background-1/60 rounded-full hover:bg-background-1"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Image Counter Badge */}
            {settings.showCounter && mainBanners.length > 0 && (
              <div className="absolute top-6 text-white right-6 z-20 bg-overlay backdrop-blur-md text-neutral-0 px-4 py-2 rounded-full text-sm font-semibold border border-background-1/20">
                {currentImage + 1} / {mainBanners.length}
              </div>
            )}
          </div>

          {/* Side Images - Từ danh mục */}
          <div className="flex-col gap-4 hidden lg:flex">
            {sideBanners.length > 0 ? (
              sideBanners.slice(0, 2).map((banner, index) => {
                const bannerImage = banner.image?.url;
                return (
                  <div
                    key={banner._id || `side-${index}`}
                    className="relative h-[240px] overflow-hidden rounded-xl shadow-md group cursor-pointer"
                    onClick={() => banner.categoryId && handleSideBannerClick(banner.categoryId)}
                  >
                    {bannerImage ? (
                      <img
                        src={bannerImage}
                        alt={banner.category?.name || `Danh mục ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-2 flex items-center justify-center">
                        <p className="text-neutral-6 text-sm">Chưa có banner</p>
                      </div>
                    )}

                  

                    {/* Hover Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <div className="text-neutral-0">
                        <p className="text-sm text-neutral-5 font-medium opacity-80">
                          {banner.category?.name || "Khám phá thêm"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="space-y-6">
                {[1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="h-[235px] bg-neutral-2 rounded-3xl flex items-center justify-center"
                  >
                    <p className="text-neutral-6 text-sm">Chưa có banner</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        {features.length > 0 && (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={`feature-${index}`}
                feature={{
                  ...feature,
                  icon: getIconComponent(feature.icon),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeBanner;


