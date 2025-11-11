import { useEffect } from "react";
import { Card } from "@/foundation/components/info/Card";
import Section from "@/foundation/components/sections/Section";
import { useProfileOrders } from "../../hooks/useOrder";

const OrdersPanel = () => {
  const { orders, status, loadOrders } = useProfileOrders();

  useEffect(() => {
    loadOrders(1, 10);
  }, [loadOrders]);

  return (
    <Section title="Đơn hàng của tôi">
      <Card className="space-y-4">
        <div className="text-sm text-neutral-6">Trạng thái: {status}</div>
        <div className="space-y-3">
          {orders?.length ? (
            orders.map((o) => (
              <div key={o._id} className="p-4 border rounded-xl border-border-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Mã đơn: {o.code || o._id}</div>
                  <div className="text-sm text-neutral-6">{o.status}</div>
                </div>
                <div className="text-sm text-neutral-6">Tổng tiền: {o.totalAmount}</div>
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




