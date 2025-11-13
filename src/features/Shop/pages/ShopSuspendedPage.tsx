import Section from "@/foundation/components/sections/Section";
import { Card } from "@/foundation/components/info/Card";
import { AlertTriangle, Ban, MessageCircle, ExternalLink } from "lucide-react";
import Button from "@/foundation/components/buttons/Button";

const ShopSuspendedPage = () => {
  return (
    <Section title="Cửa hàng bị hạn chế">
      <Card className="container mx-auto my-6" paddingX="lg" paddingY="lg" shadow="md">
        <Card.Body className="flex flex-col items-center space-y-6 text-center">
          {/* Icon Container */}
          <div className="relative">
            <div className="flex justify-center items-center w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full shadow-lg">
              <Ban className="w-10 h-10 text-red-600" />
            </div>
            <div className="flex absolute -top-1 -right-1 justify-center items-center w-6 h-6 bg-red-500 rounded-full shadow-md">
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neutral-10">Cửa hàng đang bị hạn chế</h2>
            <p className="max-w-md text-base text-neutral-6">
              Cửa hàng của bạn đã bị tạm ngưng hoạt động do vi phạm quy định của nền tảng.
            </p>
          </div>

          {/* Warning Box */}
          <div className="p-4 space-y-3 w-full bg-red-50 rounded-lg border border-red-200">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-left">
                <p className="text-sm font-semibold text-red-900">Lý do hạn chế</p>
                <p className="text-sm text-red-700">
                  Vui lòng kiểm tra email hoặc thông báo trong hệ thống để xem chi tiết vi phạm và
                  các bước cần thực hiện để khôi phục cửa hàng.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full sm:flex-row">
            <Button
              variant="solid"
              color="blue"
              fullWidth
              icon={<MessageCircle className="w-4 h-4" />}
            >
              Liên hệ hỗ trợ
            </Button>
            <Button
              variant="outline"
              color="blue"
              fullWidth
              icon={<ExternalLink className="w-4 h-4" />}
            >
              Xem thông báo vi phạm
            </Button>
          </div>

          {/* Status Info */}
          <div className="flex gap-2 items-center text-sm text-neutral-6">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Trạng thái: Bị hạn chế</span>
          </div>
        </Card.Body>
      </Card>
    </Section>
  );
};

export default ShopSuspendedPage;
