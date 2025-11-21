import React from "react";
import { Store } from "lucide-react";

interface ShopBannerProps {
  banner?: string;
  logo?: string;
  name?: string;
}

const ShopBanner: React.FC<ShopBannerProps> = ({ banner, logo, name }) => {
  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden bg-gradient-to-r from-primary-6 to-primary-8 rounded-xl">
      {banner ? (
        <img
          src={banner}
          alt={`${name || "Shop"} banner`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex justify-center items-center w-full h-full">
          <Store className="w-24 h-24 text-white/30" />
        </div>
      )}
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
};

export default ShopBanner;

