import { useEffect, useMemo, useState } from "react";
import Button from "@/foundation/components/buttons/Button";
import { ShopOrder } from "@/core/api/shop-management/type";
import OrderStepper from "@/features/Profile/components/orders/components/OrderStepper";
import Tooltip from "@/foundation/components/tooltip/Tooltip";
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Phone,
  CreditCard,
  Copy,
  MessageCircle,
  NotebookPen,
  History,
  Printer,
} from "lucide-react";
import { useAppDispatch } from "@/app/store";
import { addToast } from "@/app/store/slices/toast";
import { shopManagementApi } from "@/core/api/shop-management";
import { ReactNode } from "react";

export interface ShopOrderAction {
  status: string;
  label: string;
  color: string;
}

interface ShopOrderCardProps {
  order: ShopOrder;
  orderNumber: string;
  status: string;
  orderItems: Array<{ productName?: string; quantity?: number; price?: number; totalPrice?: number }>;
  actions: ShopOrderAction[];
  formatPrice: (value: number) => string;
  onActionClick: (order: ShopOrder, status: string) => void;
  isUpdating: boolean;
  enableSelection?: boolean;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onQuickConfirm?: () => void;
  onQuickCancel?: () => void;
  onChat?: () => void;
  onPrintPacking?: () => void;
  onPrintShipping?: () => void;
}

const statusConfig: Record<
  string,
  { label: string; badgeClass: string; icon: ReactNode }
> = {
  pending: {
    label: "Chờ xử lý",
    badgeClass: "bg-warning/15 text-warning",
    icon: <Clock className="h-4 w-4" />,
  },
  processing: {
    label: "Đang xử lý",
    badgeClass: "bg-primary-10 text-primary-6",
    icon: <Package className="h-4 w-4" />,
  },
  shipped: {
    label: "Đã giao hàng",
    badgeClass: "bg-blue-100 text-blue-600",
    icon: <Truck className="h-4 w-4" />,
  },
  delivered: {
    label: "Đã nhận hàng",
    badgeClass: "bg-success/10 text-success",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  cancelled: {
    label: "Đã hủy",
    badgeClass: "bg-error/10 text-error",
    icon: <XCircle className="h-4 w-4" />,
  },
};

const ShopOrderCard = ({
  order,
  orderNumber,
  status,
  orderItems,
  actions,
  formatPrice,
  onActionClick,
  isUpdating,
  enableSelection = false,
  isSelected = false,
  onSelectChange,
  onQuickConfirm,
  onQuickCancel,
  onChat,
  onPrintPacking,
  onPrintShipping,
}: ShopOrderCardProps) => {
  const dispatch = useAppDispatch();
  const statusInfo = statusConfig[status] || statusConfig.pending;

  const totalItems = useMemo(
    () => orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [orderItems]
  );

  // Get shipping address - backend returns it as shippingAddress
  const shippingAddress = (order as any).shippingAddress;
  const customerName =
    shippingAddress?.name || 
    shippingAddress?.fullName || 
    order.user?.name || 
    "—";
  const phone =
    shippingAddress?.phone || 
    (order as any).user?.phone || 
    "—";
  const addressParts = [
    shippingAddress?.address,
    shippingAddress?.ward,
    shippingAddress?.district,
    shippingAddress?.city,
  ].filter(Boolean);
  const formattedAddress = addressParts.length > 0 ? addressParts.join(", ") : "—";

  const historyRaw = (order as any).timeline || (order as any).orderHistoryDetails || (order as any).orderHistory || [];
  const timelineEntries = Array.isArray(historyRaw)
    ? historyRaw
        .map((entry: any) =>
          typeof entry === "string"
            ? { status: entry, description: "", createdAt: null }
            : entry
        )
        .reverse()
    : [];

  const trustTag = useMemo(() => {
    if ((order as any).trustScore) {
      const score = (order as any).trustScore;
      if (score >= 80) return { label: "Khách thân thiết", className: "bg-success/15 text-success" };
      if (score <= 40) return { label: "Cần chú ý", className: "bg-warning/20 text-warning" };
    }
    if ((order as any).orderHistory?.length > 3) {
      return { label: "Khách quen", className: "bg-primary-10 text-primary-6" };
    }
    return { label: "Khách mới", className: "bg-neutral-2 text-neutral-6" };
  }, [order]);

  // Initialize internal notes from order object if available
  const initialNotes = (order as any).internalNotes || [];
  const [internalNotes, setInternalNotes] = useState<Array<{ _id?: string; note: string; createdAt?: string }>>(initialNotes);
  const [noteInput, setNoteInput] = useState("");
  const [showTimeline, setShowTimeline] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Update internal notes when order changes
  useEffect(() => {
    if ((order as any).internalNotes) {
      setInternalNotes((order as any).internalNotes);
    }
  }, [order]);

  // Load internal notes from API if needed
  useEffect(() => {
    if (showNotes && internalNotes.length === 0 && !loadingNotes) {
      loadInternalNotes();
    }
  }, [showNotes, order._id]);

  // Load timeline from API if needed
  useEffect(() => {
    if (showTimeline && timelineEntries.length === 0) {
      loadTimeline();
    }
  }, [showTimeline, order._id]);

  const loadInternalNotes = async () => {
    try {
      setLoadingNotes(true);
      const result = await shopManagementApi.getInternalNotes(order._id);
      if (result.success && result.data) {
        setInternalNotes(result.data);
      }
    } catch (error) {
      console.error("Failed to load internal notes", error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const loadTimeline = async () => {
    try {
      const result = await shopManagementApi.getOrderTimeline(order._id);
      if (result.success && result.data) {
        // Timeline is already populated from formatOrderForShop
        // This is just to refresh if needed
      }
    } catch (error) {
      console.error("Failed to load timeline", error);
    }
  };

  const handleAddNote = async () => {
    const trimmed = noteInput.trim();
    if (!trimmed) return;
    try {
      const result = await shopManagementApi.addInternalNote(order._id, trimmed);
      if (result.success && result.data) {
        setInternalNotes((prev) => [result.data, ...prev]);
        setNoteInput("");
        dispatch(addToast({ type: "success", message: "Đã thêm ghi chú nội bộ" }));
      }
    } catch (error: any) {
      dispatch(addToast({ type: "error", message: error?.message || "Không thể thêm ghi chú" }));
    }
  };

  const handleCopy = (value?: string, label?: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(label || null);
      dispatch(addToast({ type: "success", message: `${label || "Thông tin"} đã được sao chép` }));
      setTimeout(() => setCopiedField(null), 1500);
    });
  };

  const statusLabelText = (value: string) => {
    const map: Record<string, string> = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipped: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
      confirmed: "Đã xác nhận",
    };
    return map[value] || value;
  };


  return (
    <div className="rounded-2xl border border-border-2 bg-background-1 p-5 shadow-sm transition hover:border-primary-4">
      <div className="flex flex-wrap items-center gap-4 border-b border-border-1 pb-4">
        <div className="flex items-center gap-3">
          {enableSelection && (
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary-6"
              checked={isSelected}
              onChange={(event) => onSelectChange?.(event.target.checked)}
            />
          )}
          <p className="text-xs uppercase tracking-wide text-neutral-5">Mã đơn</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-neutral-9">{orderNumber}</p>
            <button
              type="button"
              onClick={() => handleCopy(orderNumber, "Mã đơn")}
              className="text-neutral-5 transition hover:text-primary-6"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          {copiedField === "Mã đơn" && <span className="text-xs text-primary-6">Đã sao chép</span>}
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${statusInfo.badgeClass}`}>
            {statusInfo.icon}
            {statusInfo.label}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] ${trustTag.className}`}>
            {trustTag.label}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <OrderStepper status={status as any} isCancelled={status === "cancelled"} />

        <div className="grid gap-4 rounded-2xl border border-border-2 bg-background-2 p-4 text-sm text-neutral-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neutral-8">
              <User className="h-4 w-4 text-neutral-5" />
              <span className="font-semibold text-neutral-9">{customerName}</span>
              <button
                type="button"
                onClick={() => handleCopy(customerName, "Tên khách")}
                className="text-neutral-5 transition hover:text-primary-6"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-neutral-5" />
              <span>{phone}</span>
              <button
                type="button"
                onClick={() => handleCopy(phone, "Số điện thoại")}
                className="text-neutral-5 transition hover:text-primary-6"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-neutral-5" />
              <span>{formattedAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-7">
              <Package className="h-4 w-4 text-neutral-5" />
              <span>Số lượng: {totalItems} sản phẩm</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-5" />
              <span>
                Ngày đặt:{" "}
                <span className="font-medium text-neutral-9">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "--"}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-neutral-5" />
              <span>Thanh toán: {order.paymentMethod?.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-neutral-5" />
              <span>Mã vận đơn: {order.trackingNumber || "Chưa cập nhật"}</span>
              {order.trackingNumber && (
                <button
                  type="button"
                  onClick={() => handleCopy(order.trackingNumber, "Mã vận đơn")}
                  className="text-neutral-5 transition hover:text-primary-6"
                >
                  <Copy className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-border-2 bg-background-2 p-3">
          {orderItems.length > 0 ? (
            orderItems.map((item, index) => (
              <Tooltip key={`${item.productName}-${index}`} content={item.productName}>
                <div className="flex items-center gap-3 text-sm text-neutral-7">
                  <span className="min-w-[16px] text-xs text-neutral-5">{index + 1}.</span>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-9">{item.productName || "Sản phẩm"}</p>
                    <p className="text-xs text-neutral-5">x{item.quantity ?? 0}</p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-9">
                    {formatPrice(item.totalPrice ?? item.price ?? 0)}
                  </span>
                </div>
              </Tooltip>
            ))
          ) : (
            <p className="text-sm text-neutral-5 italic">Không có thông tin chi tiết sản phẩm</p>
          )}
        </div>

        {order.notes && (
          <div className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
            <span className="font-semibold">Ghi chú:</span> {order.notes}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 border-t border-border-1 pt-4">
          <div className="flex-1 text-sm text-neutral-6">
            Tổng tiền:
            <span className="ml-2 text-lg font-bold text-primary-6">
              {formatPrice(order.totalAmount)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {onQuickConfirm && (
              <Button
                size="sm"
                color="green"
                onClick={onQuickConfirm}
                disabled={isUpdating}
              >
                Xác nhận & đóng gói
              </Button>
            )}
            {onQuickCancel && (
              <Button
                size="sm"
                color="red"
                variant="outline"
                onClick={onQuickCancel}
                disabled={isUpdating}
              >
                Hủy nhanh
              </Button>
            )}
            {actions.length > 0 ? (
              actions.map((action) => (
                <Button
                  key={action.status}
                  size="sm"
                  color={action.color as any}
                  onClick={() => onActionClick(order, action.status)}
                  disabled={isUpdating}
                  loading={isUpdating}
                >
                  {action.label}
                </Button>
              ))
            ) : (
              <span className="text-xs text-neutral-5 italic">Không có thao tác</span>
            )}
            <Button size="sm" variant="ghost" icon={<MessageCircle className="h-4 w-4" />} onClick={onChat}>
              Chat khách
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<Printer className="h-4 w-4" />}
              onClick={onPrintPacking}
            >
              In phiếu nhặt
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<Printer className="h-4 w-4" />}
              onClick={onPrintShipping}
            >
              In vận đơn
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<History className="h-4 w-4" />}
              onClick={() => setShowTimeline((prev) => !prev)}
            >
              Lịch sử
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<NotebookPen className="h-4 w-4" />}
              onClick={() => setShowNotes((prev) => !prev)}
            >
              Nội bộ
            </Button>
          </div>
        </div>

        {showTimeline && (
          <div className="space-y-2 rounded-xl border border-border-2 bg-background-2 p-3">
            {timelineEntries.length > 0 ? (
              timelineEntries.map((entry: any, index: number) => (
                <div key={`${entry._id || entry.status}-${index}`} className="flex items-center justify-between text-sm text-neutral-7">
                  <div>
                    <p className="font-medium text-neutral-9">
                      {entry.description || statusLabelText(entry.status)}
                    </p>
                    <p className="text-xs text-neutral-5">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleString("vi-VN") : "--"}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-neutral-5">
                    {statusLabelText(entry.status)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-6">Chưa có lịch sử chi tiết</p>
            )}
          </div>
        )}

        {showNotes && (
          <div className="space-y-3 rounded-xl border border-border-2 bg-background-2 p-3">
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={(event) => setNoteInput(event.target.value)}
                placeholder="Thêm ghi chú nội bộ..."
                className="flex-1 rounded-lg border border-border-2 bg-background-1 px-3 py-2 text-sm text-neutral-9"
              />
              <Button size="sm" onClick={handleAddNote}>
                Lưu
              </Button>
            </div>
            <div className="space-y-2 text-sm text-neutral-6">
              {loadingNotes ? (
                <p className="text-sm text-neutral-5 italic">Đang tải...</p>
              ) : internalNotes.length > 0 ? (
                internalNotes.map((note, index) => (
                  <div key={note._id || `note-${index}`} className="rounded-lg bg-background-1 px-3 py-2">
                    <p className="text-neutral-9">{note.note}</p>
                    {note.createdAt && (
                      <p className="text-xs text-neutral-5 mt-1">
                        {new Date(note.createdAt).toLocaleString("vi-VN")}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-5 italic">Chưa có ghi chú nội bộ</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopOrderCard;



