import React from "react";
import { CreditCard, Wallet, Building2, Truck } from "lucide-react";
import type { PaymentMethod } from "@/core/api/payments/type";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethod?: string;
  onSelectMethod: (methodId: string) => void;
  isLoading?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  methods,
  selectedMethod,
  onSelectMethod,
  isLoading = false,
}) => {
  const getMethodIcon = (type: PaymentMethod["type"]) => {
    switch (type) {
      case "bank_transfer":
        return <Building2 className="w-5 h-5" />;
      case "cod":
        return <Truck className="w-5 h-5" />;
      case "wallet":
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const getMethodLabel = (type: PaymentMethod["type"]) => {
    switch (type) {
      case "bank_transfer":
        return "Chuyển khoản qua ngân hàng (Sepay)";
      case "cod":
        return "Thanh toán khi nhận hàng";
      case "wallet":
      default:
        return "Thanh toán bằng ví";
    }
  };

  const activeMethods = methods.filter((method) => method.isActive);

  if (isLoading) {
    return (
      <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
        <SectionTitle className="mb-4">Phương thức thanh toán</SectionTitle>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-neutral-2 animate-pulse rounded-lg border border-border-1"
            />
          ))}
        </div>
      </Section>
    );
  }

  if (activeMethods.length === 0) {
    return (
      <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
        <SectionTitle className="mb-4">Phương thức thanh toán</SectionTitle>
        <p className="text-sm text-neutral-6">Không có phương thức thanh toán nào khả dụng</p>
      </Section>
    );
  }

  return (
    <Section className="bg-background-2 max-h-[450px] overflow-y-auto hidden-scrollbar rounded-2xl p-6 border border-border-1">
      <SectionTitle className="mb-4">Phương thức thanh toán</SectionTitle>
      <div className="space-y-3">
        {activeMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelectMethod(method.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedMethod === method.id
                ? "border-primary-6 bg-primary-10"
                : "border-border-1 bg-background-1 hover:border-primary-4 hover:bg-primary-10/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex justify-center items-center w-10 h-10 rounded-lg ${
                  selectedMethod === method.id ? "bg-primary-6 text-white" : "bg-neutral-2 text-neutral-7"
                }`}
              >
                {getMethodIcon(method.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-neutral-9">{method.name}</h3>
                {method.description && (
                  <p className="text-sm text-neutral-6 mt-1">{method.description}</p>
                )}
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === method.id
                    ? "border-primary-6 bg-primary-6"
                    : "border-neutral-4 bg-transparent"
                }`}
              >
                {selectedMethod === method.id && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Section>
  );
};

export default PaymentMethodSelector;
