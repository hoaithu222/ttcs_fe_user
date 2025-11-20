import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import Button from "@/foundation/components/buttons/Button";
import Input from "@/foundation/components/input/Input";
import TextArea from "@/foundation/components/input/TextArea";
import { X } from "lucide-react";
import { ShopOrder } from "@/core/api/shop-management/type";

interface UpdateOrderStatusModalProps {
  open: boolean;
  onClose: () => void;
  order: ShopOrder | null;
  currentStatus: string;
  newStatus: string;
  onConfirm: (data: { orderStatus: string; trackingNumber?: string; notes?: string }) => void;
  loading?: boolean;
}

const UpdateOrderStatusModal: React.FC<UpdateOrderStatusModalProps> = ({
  open,
  onClose,
  order,
  currentStatus,
  newStatus,
  onConfirm,
  loading = false,
}) => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipped: "Đã giao hàng",
      delivered: "Đã nhận hàng",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const requiresTrackingNumber = newStatus === "shipped";
  const requiresNotes = newStatus === "cancelled" || newStatus === "processing";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      orderStatus: newStatus,
      trackingNumber: trackingNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    // Reset form
    setTrackingNumber("");
    setNotes("");
  };

  const handleClose = () => {
    setTrackingNumber("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background-1 p-6 shadow-xl border border-border-1">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold text-neutral-9">
              Cập nhật trạng thái đơn hàng
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-neutral-6 hover:text-neutral-9 transition-colors"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {order && (
            <div className="mb-4 p-3 bg-neutral-2 rounded-lg">
              <p className="text-sm text-neutral-6">Mã đơn hàng</p>
              <p className="font-semibold text-neutral-9">#{order.orderNumber}</p>
              <div className="mt-2 flex gap-2 text-sm">
                <span className="text-neutral-6">Từ:</span>
                <span className="font-medium text-neutral-9">{getStatusLabel(currentStatus)}</span>
                <span className="text-neutral-6">→</span>
                <span className="font-medium text-primary-6">{getStatusLabel(newStatus)}</span>
              </div>
            </div>
          )}

          <Form.Root onSubmit={handleSubmit} className="space-y-4">
            {requiresTrackingNumber && (
              <div>
                <Input
                  name="trackingNumber"
                  label="Mã vận đơn (Bắt buộc)"
                  placeholder="Nhập mã vận đơn"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required={requiresTrackingNumber}
                  description="Mã vận đơn từ đơn vị vận chuyển"
                />
              </div>
            )}

            {requiresNotes && (
              <div>
                <TextArea
                  name="notes"
                  label={newStatus === "cancelled" ? "Lý do hủy đơn (Bắt buộc)" : "Ghi chú"}
                  placeholder={
                    newStatus === "cancelled"
                      ? "Nhập lý do hủy đơn hàng..."
                      : "Nhập ghi chú cho đơn hàng..."
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  required={newStatus === "cancelled"}
                  description={
                    newStatus === "cancelled"
                      ? "Vui lòng giải thích lý do hủy đơn hàng"
                      : "Thông tin này sẽ được gửi đến khách hàng"
                  }
                />
              </div>
            )}

            {!requiresTrackingNumber && !requiresNotes && (
              <div className="p-3 bg-primary-10/30 rounded-lg border border-primary-6/20">
                <p className="text-sm text-primary-7">
                  Bạn có muốn thêm ghi chú cho đơn hàng này không?
                </p>
              </div>
            )}

            {!requiresTrackingNumber && !requiresNotes && (
              <div>
                <TextArea
                  name="optionalNotes"
                  label="Ghi chú (Tùy chọn)"
                  placeholder="Nhập ghi chú cho đơn hàng..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" color="gray" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit" color="blue" variant="solid" loading={loading}>
                Xác nhận
              </Button>
            </div>
          </Form.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UpdateOrderStatusModal;
