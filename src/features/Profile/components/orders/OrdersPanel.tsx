import { useCallback, useEffect, useState } from "react";
import { Card } from "@/foundation/components/info/Card";
import Section from "@/foundation/components/sections/Section";
import { useProfileOrders } from "../../hooks/useOrder";
import Button from "@/foundation/components/buttons/Button";
import { userOrdersApi } from "@/core/api/orders";

const OrdersPanel = () => {
  const { orders, status, loadOrders } = useProfileOrders();
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders(1, 10);
  }, [loadOrders]);

  const handleCancel = useCallback(
    async (orderId: string) => {
      if (cancelingId) return;
      const confirmCancel = window.confirm("Bạn có chắc muốn hủy đơn hàng này?");
      if (!confirmCancel) return;
      try {
        setCancelingId(orderId);
        await userOrdersApi.cancelOrder(orderId);
        loadOrders(1, 10);
      } finally {
        setCancelingId(null);
      }
    },
    [cancelingId, loadOrders]
  );

  return (
    <Section title="Đơn hàng của tôi">
      <Card className="space-y-4">
        <div className="space-y-3">
          {orders?.length ? (
            orders.map((o: any) => (
              <div key={o._id} className="p-4 border rounded-xl border-border-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Mã đơn: {o.code || o._id}</div>
                  <div className="text-sm text-neutral-6">{o.status}</div>
                </div>
                <div className="text-sm text-neutral-6">Tổng tiền: {o.totalAmount}</div>
                {(o.status === "pending" || o.status === "processing") && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(o._id)}
                      disabled={cancelingId === o._id}
                    >
                      {cancelingId === o._id ? "Đang hủy..." : "Hủy đơn hàng"}
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div>Chưa có đơn hàng nào</div>
          )}
        </div>
      </Card>
    </Section>
  );
};

export default OrdersPanel;
