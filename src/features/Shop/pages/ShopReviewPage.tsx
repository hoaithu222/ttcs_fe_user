import Section from "@/foundation/components/sections/Section";
import { Card } from "@/foundation/components/info/Card";
import { Clock, FileCheck, Bell } from "lucide-react";

const ShopReviewPage = () => {
  return (
    <Section title="Hồ sơ đang chờ phê duyệt">
      <Card className="container mx-auto my-6" paddingX="lg" paddingY="lg" shadow="md">
        <Card.Body className="flex flex-col items-center space-y-6 text-center">
          {/* Icon Container */}
          <div className="relative">
            <div className="flex justify-center items-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full shadow-lg">
              <Clock className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>
            <div className="flex absolute -top-1 -right-1 justify-center items-center w-6 h-6 bg-blue-500 rounded-full shadow-md">
              <FileCheck className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neutral-10">Đang chờ phê duyệt</h2>
            <p className="max-w-md text-base text-neutral-6">
              Hồ sơ cửa hàng của bạn đang được xem xét và phê duyệt bởi đội ngũ của chúng tôi.
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 space-y-3 w-full bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex gap-3 items-start">
              <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-left">
                <p className="text-sm font-semibold text-blue-900">Thông báo</p>
                <p className="text-sm text-blue-700">
                  Chúng tôi sẽ thông báo qua email và hệ thống khi quá trình xét duyệt hoàn tất.
                  Thời gian xét duyệt thường từ 1-3 ngày làm việc.
                </p>
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="flex gap-2 items-center text-sm text-neutral-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Trạng thái: Đang xử lý</span>
          </div>
        </Card.Body>
      </Card>
    </Section>
  );
};

export default ShopReviewPage;
