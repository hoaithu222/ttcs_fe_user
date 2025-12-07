import React, { useEffect, useRef, useState } from "react";
import * as Form from "@radix-ui/react-form";
import Input from "@/foundation/components/input/Input";
import TextArea from "@/foundation/components/input/TextArea";
import Select from "@/foundation/components/input/Select";
import Modal from "@/foundation/components/modal/Modal";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import { Truck } from "lucide-react";
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
  const [cancelReason, setCancelReason] = useState("out_of_stock");
  const formRef = useRef<HTMLFormElement>(null);

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

  // Helper function to derive order number with fallback
  const getOrderNumber = (order: ShopOrder | null): string => {
    if (!order) return "#UNKNOWN";
    if (order.orderNumber) return order.orderNumber;
    if (order._id) return `#${String(order._id).slice(-6).toUpperCase()}`;
    return "#UNKNOWN";
  };

  const handleSubmit = () => {
    const finalNotes =
      newStatus === "cancelled"
        ? [cancelReasons.find((reason) => reason.value === cancelReason)?.label, notes.trim()]
            .filter(Boolean)
            .join(" - ")
        : notes.trim();
    onConfirm({
      orderStatus: newStatus,
      trackingNumber: trackingNumber.trim() || undefined,
      notes: finalNotes || undefined,
    });
    // Reset form
    setTrackingNumber("");
    setNotes("");
  };

  const handleClose = () => {
    setTrackingNumber("");
    setNotes("");
    setCancelReason("out_of_stock");
    onClose();
  };

  const triggerSubmit = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <Modal
      open={open}
      size="lg"
      onOpenChange={(openState) => {
        if (!openState) handleClose();
      }}
      onCancel={handleClose}
      onConfirm={triggerSubmit}
      confirmText={loading ? "Đang cập nhật..." : "Xác nhận"}
      closeText="Hủy"
      disabled={loading}
      className="space-y-6"
      title={
        <div className="flex items-center gap-3">
          <IconCircleWrapper size="md" color="info">
            <Truck className="h-5 w-5 text-info" />
          </IconCircleWrapper>
          <div>
            <h2 className="text-lg font-semibold text-neutral-9">Cập nhật trạng thái đơn</h2>
            <p className="text-sm text-neutral-6">Thông báo khách hàng ngay sau khi thay đổi</p>
          </div>
        </div>
      }
    >
      <Form.Root
        ref={formRef}
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <AlertMessage
          type="info"
          title="Kiểm tra trước khi xác nhận"
          message="Trạng thái mới sẽ được áp dụng ngay và gửi thông báo cho người mua."
        />

        {order && (
          <div className="rounded-xl border border-border-2 bg-background-2 p-4 text-sm text-neutral-6">
            <div className="flex flex-wrap gap-3">
              <div>
                <p className="text-neutral-5">Mã đơn hàng</p>
                <p className="text-base font-semibold text-neutral-9">{getOrderNumber(order)}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-neutral-5">Từ</span>
                <span className="font-semibold text-neutral-9">{getStatusLabel(currentStatus)}</span>
                <span className="text-neutral-5">→</span>
                <span className="font-semibold text-primary-6">{getStatusLabel(newStatus)}</span>
              </div>
            </div>
          </div>
        )}

        {requiresTrackingNumber && (
          <Input
            name="trackingNumber"
            label="Mã vận đơn (bắt buộc)"
            placeholder="Nhập mã vận đơn"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            required
            description="Mã từ đối tác vận chuyển giúp khách hàng theo dõi đơn"
          />
        )}

        {newStatus === "cancelled" && (
          <Select
            name="cancelReason"
            label="Lý do hủy đơn"
            options={cancelReasons}
            value={cancelReason}
            onChange={(value) => setCancelReason(value)}
            required
          />
        )}

        {requiresNotes ? (
          <TextArea
            name="notes"
            label={newStatus === "cancelled" ? "Lý do hủy đơn (bắt buộc)" : "Ghi chú"}
            placeholder={
              newStatus === "cancelled"
                ? "Nhập lý do hủy để thông báo cho khách hàng..."
                : "Nhập ghi chú cho đơn hàng..."
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            required={newStatus === "cancelled"}
            description="Thông tin này hiển thị trong lịch sử đơn hàng của khách"
          />
        ) : (
          <TextArea
            name="optionalNotes"
            label="Ghi chú (tùy chọn)"
            placeholder="Bạn có thể cung cấp thêm thông điệp tới khách hàng..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        )}

        {!requiresTrackingNumber && !requiresNotes && (
          <div className="rounded-xl border border-primary-6/30 bg-primary-10/20 px-4 py-3 text-sm text-primary-7">
            Ghi chú giúp khách hàng hiểu rõ hơn về trạng thái đơn hàng.
          </div>
        )}

        <Form.Submit asChild>
          <button type="submit" className="hidden" aria-hidden />
        </Form.Submit>
      </Form.Root>
    </Modal>
  );
};

export default UpdateOrderStatusModal;

const cancelReasons = [
  { value: "out_of_stock", label: "Hết hàng" },
  { value: "customer_request", label: "Khách yêu cầu hủy" },
  { value: "fraud_suspect", label: "Nghi ngờ gian lận" },
  { value: "pricing_error", label: "Sai giá niêm yết" },
  { value: "others", label: "Lý do khác" },
];