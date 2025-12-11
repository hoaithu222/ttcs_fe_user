import React, { useMemo } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Shield,
  Truck,
  Facebook,
  Instagram,
  MessageCircle,
  Building2,
} from "lucide-react";
import { Shop } from "@/core/api/shops/type";
import { formatAddressFromCodes } from "@/shared/common/data-address/address.utils";

interface ShopInfoProps {
  shop: Shop & {
    banner?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    address?: { provinceCode?: number; districtCode?: number; wardCode?: number } | string;
    openHour?: string;
    closeHour?: string;
    workingDays?: string;
    returnPolicy?: string;
    shippingPolicy?: string;
    facebook?: string;
    instagram?: string;
    zalo?: string;
    businessType?: string;
    verifiedAt?: string;
    activatedAt?: string;
  };
}

const ShopInfo: React.FC<ShopInfoProps> = ({ shop }) => {
  const formattedAddress = useMemo(() => {
    if (!shop.address) return "Chưa cập nhật";
    if (typeof shop.address === "string") return shop.address;
    return formatAddressFromCodes(shop.address, "Chưa cập nhật");
  }, [shop.address]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Left Column */}
      <div className="space-y-3">
        {/* Description */}
        {shop.description && (
          <div className="p-4 bg-background-1 rounded-2xl border border-border-1 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-9 mb-2">Giới thiệu</h3>
            <p className="text-sm text-neutral-7 leading-relaxed">{shop.description}</p>
          </div>
        )}

        {/* Contact Information */}
        <div className="p-4 bg-background-1 rounded-2xl border border-border-1 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-9 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-6" />
            Thông tin liên hệ
          </h3>
          <div className="space-y-3">
            {shop.contactName && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Building2 className="w-4 h-4 text-neutral-6" />
                </div>
                <div className="flex  gap-1 items-center">
                  <p className="text-xs text-neutral-5">Người liên hệ :</p>
                  <p className="text-sm font-medium text-neutral-9">{shop.contactName}</p>
                </div>
              </div>
            )}
            {shop.contactPhone && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Phone className="w-4 h-4 text-neutral-6" />
                </div>
                <div className="flex  gap-1 items-center">
                  <p className="text-xs text-neutral-5">Điện thoại :</p>
                  <a
                    href={`tel:${shop.contactPhone}`}
                    className="text-sm font-medium text-primary-6 hover:underline"
                  >
                    {shop.contactPhone}
                  </a>
                </div>
              </div>
            )}
            {shop.contactEmail && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Mail className="w-4 h-4 text-neutral-6" />
                </div>
                <div className="flex  gap-1 items-center">
                  <p className="text-xs text-neutral-5">Email :</p>
                  <a
                    href={`mailto:${shop.contactEmail}`}
                    className="text-sm font-medium text-primary-6 hover:underline"
                  >
                    {shop.contactEmail}
                  </a>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <MapPin className="w-4 h-4 text-neutral-6" />
              </div>
              <div className="flex  gap-1 items-center">
                <p className="text-xs text-neutral-5">Địa chỉ :</p>
                <p className="text-sm font-medium text-neutral-9">{formattedAddress}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column */}
      <div className="space-y-3">
        {/* Policies */}
        <div className="space-y-4 p-4 bg-background-1 rounded-2xl border border-border-1 shadow-sm">
  {shop.returnPolicy && (
    <div className="flex items-start gap-3">
      {/* Icon neo lên trên cùng với mt-0.5 */}
      <Shield className="w-5 h-5 text-primary-6 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="text-sm font-semibold text-neutral-9">Chính sách đổi trả</h3>
        {/* mt-1 tạo khoảng cách nhẹ giữa tiêu đề và nội dung */}
        <p className="mt-1 text-sm text-neutral-7 leading-relaxed">
          {shop.returnPolicy}
        </p>
      </div>
    </div>
  )}



  {shop.shippingPolicy && (
    <div className="flex items-start gap-3">
      <Truck className="w-5 h-5 text-primary-6 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="text-sm font-semibold text-neutral-9">Chính sách vận chuyển</h3>
        <p className="mt-1 text-sm text-neutral-7 leading-relaxed">
          {shop.shippingPolicy}
        </p>
      </div>
    </div>
  )}
</div>

        {/* Social Media */}
        {(shop.facebook || shop.instagram || shop.zalo) && (
          <div className="p-5 bg-background-1 rounded-2xl border border-border-1 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-9 mb-4">Mạng xã hội</h3>
            <div className="flex flex-wrap gap-3">
              {shop.facebook && (
                <a
                  href={shop.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Facebook</span>
                </a>
              )}
              {shop.instagram && (
                <a
                  href={shop.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
                >
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span className="text-sm font-medium text-pink-600">Instagram</span>
                </a>
              )}
              {shop.zalo && (
                <a
                  href={shop.zalo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Zalo</span>
                </a>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ShopInfo;

