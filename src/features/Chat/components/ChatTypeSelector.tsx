import React from "react";
import { Store, HeadphonesIcon } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";

interface ChatTypeSelectorProps {
  onSelectType: (type: "admin" | "shop", shopId?: string) => void;
  selectedShopId?: string;
  shopName?: string;
}

const ChatTypeSelector: React.FC<ChatTypeSelectorProps> = ({
  onSelectType,
  selectedShopId,
  shopName,
}) => {
  return (
    <div className="p-6 space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-neutral-10 mb-2">
          Chọn loại cuộc trò chuyện
        </h2>
        <p className="text-sm text-neutral-6">
          Chọn cách bạn muốn liên hệ với chúng tôi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CSKH với Admin */}
        <div
          onClick={() => onSelectType("admin")}
          className="cursor-pointer transition-all bg-white rounded-lg border border-neutral-3 p-6 hover:border-primary-5 hover:shadow-md"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary-10 flex items-center justify-center">
              <HeadphonesIcon className="w-8 h-8 text-primary-6" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-10">
              Chat với CSKH
            </h3>
            <p className="text-sm text-neutral-6">
              Hỗ trợ về đơn hàng, đăng ký shop, nạp tiền và các vấn đề khác
            </p>
            <Button
              variant="outline"
              color="blue"
              size="sm"
              className="mt-2"
            >
              Bắt đầu chat
            </Button>
          </div>
        </div>

        {/* Chat với Shop */}
        {selectedShopId && (
          <div
            onClick={() => onSelectType("shop", selectedShopId)}
            className="cursor-pointer transition-all bg-white rounded-lg border border-neutral-3 p-6 hover:border-green-5 hover:shadow-md"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-green-10 flex items-center justify-center">
                <Store className="w-8 h-8 text-green-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-10">
                Chat với Shop
              </h3>
              {shopName && (
                <p className="text-sm font-medium text-neutral-8">{shopName}</p>
              )}
              <p className="text-sm text-neutral-6">
                Hỏi về sản phẩm, đơn hàng và các thông tin khác từ shop
              </p>
              <Button
                variant="outline"
                color="green"
                size="sm"
                className="mt-2"
              >
                Bắt đầu chat
              </Button>
            </div>
          </div>
        )}

        {!selectedShopId && (
          <div className="opacity-50 cursor-not-allowed bg-white rounded-lg border border-neutral-3 p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-neutral-3 flex items-center justify-center">
                <Store className="w-8 h-8 text-neutral-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-7">
                Chat với Shop
              </h3>
              <p className="text-sm text-neutral-6">
                Chọn shop từ trang sản phẩm để bắt đầu chat
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTypeSelector;

