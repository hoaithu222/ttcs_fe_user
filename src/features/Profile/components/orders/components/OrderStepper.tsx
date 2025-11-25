import { memo, useMemo } from "react";

import clsx from "clsx";

import type { Order } from "@/core/api/orders/type";

const ORDER_STEPS: Array<{
  key: Extract<Order["orderStatus"], "pending" | "processing" | "shipped" | "delivered">;
  label: string;
  description: string;
}> = [
  { key: "pending", label: "Đặt hàng", description: "Hệ thống nhận đơn" },
  { key: "processing", label: "Xác nhận", description: "Shop xác nhận & chuẩn bị" },
  { key: "shipped", label: "Vận chuyển", description: "Đơn đang được giao" },
  { key: "delivered", label: "Giao hàng", description: "Đơn đã hoàn tất" },
];

interface OrderStepperProps {
  status?: Order["orderStatus"] | Order["status"];
  isCancelled?: boolean;
}

const normalizeStatus = (
  status?: Order["orderStatus"] | Order["status"]
): (typeof ORDER_STEPS)[number]["key"] => {
  switch (status) {
    case "processing":
      return "processing";
    case "shipped":
      return "shipped";
    case "delivered":
      return "delivered";
    default:
      return "pending";
  }
};

const OrderStepper = memo(({ status, isCancelled }: OrderStepperProps) => {
  const currentStatus = normalizeStatus(status);
  const currentIndex = useMemo(
    () => ORDER_STEPS.findIndex((step) => step.key === currentStatus),
    [currentStatus]
  );

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border-1 bg-background-1 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-8">Tiến trình đơn hàng</p>
        {isCancelled ? (
          <span className="text-xs font-medium text-error">Đơn đã hủy</span>
        ) : (
          <span className="text-xs text-neutral-6">
            {ORDER_STEPS[currentIndex]?.label ?? ORDER_STEPS[0].label}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {ORDER_STEPS.map((step, index) => {
            const isCompleted = !isCancelled && index <= currentIndex;
            const isActive = !isCancelled && index === currentIndex;

            return (
              <div key={step.key} className="flex flex-1 items-center gap-2">
                <div
                  className={clsx(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    isCancelled
                      ? "border-error/60 bg-error/10 text-error"
                      : isCompleted
                        ? "border-primary-6 bg-primary-6 text-white"
                        : "border-border-1 bg-neutral-1 text-neutral-6"
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex flex-col">
                  <p
                    className={clsx(
                      "text-sm font-medium",
                      isCancelled
                        ? "text-error"
                        : isActive
                          ? "text-primary-6"
                          : "text-neutral-8"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-neutral-5">{step.description}</p>
                </div>
                {index < ORDER_STEPS.length - 1 && (
                  <div
                    className={clsx(
                      "h-0.5 flex-1 rounded-full",
                      isCancelled
                        ? "bg-error/40"
                        : index < currentIndex
                          ? "bg-primary-6"
                          : "bg-border-2"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

OrderStepper.displayName = "OrderStepper";

export default OrderStepper;


