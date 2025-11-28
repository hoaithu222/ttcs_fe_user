import React, { useState } from "react";
import Button from "@/foundation/components/buttons/Button";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import { Trash2 } from "lucide-react";
import { toastUtils } from "@/shared/utils/toast.utils";

const CacheSetting: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleClearCache = async () => {
    setLoading(true);
    try {
      // Clear localStorage
      localStorage.clear();
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cache if using service worker
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      toastUtils.success("Đã xóa bộ nhớ đệm thành công");
      
      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toastUtils.error("Không thể xóa bộ nhớ đệm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <IconCircleWrapper size="md" color="info">
          <Trash2 className="text-primary-7 dark:text-white" />
        </IconCircleWrapper>
        <div>
          <h2 className="text-2xl font-bold text-neutral-9">Xóa bộ nhớ đệm</h2>
          <p className="text-sm text-neutral-6 mt-0.5">
            Xóa dữ liệu đã lưu trong bộ nhớ đệm của trình duyệt
          </p>
        </div>
      </div>

      <AlertMessage
        type="warning"
        title="Lưu ý"
        message="Việc xóa bộ nhớ đệm sẽ xóa tất cả dữ liệu đã lưu cục bộ, bao gồm các tùy chọn và cài đặt tạm thời. Bạn có thể cần đăng nhập lại sau khi xóa."
      />

      <div className="p-6 rounded-lg bg-background-2 border border-border-2">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-base font-semibold text-neutral-9 mb-2">
              Dữ liệu sẽ bị xóa:
            </h3>
            <ul className="space-y-2 text-sm text-neutral-6">
              <li className="flex items-start gap-2">
                <span className="text-primary-6">•</span>
                <span>Dữ liệu trong localStorage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-6">•</span>
                <span>Dữ liệu trong sessionStorage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-6">•</span>
                <span>Cache của Service Worker (nếu có)</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border-2">
            <Button
              variant="primary"
              onClick={handleClearCache}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Đang xóa..." : "Xóa bộ nhớ đệm"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheSetting;

