import { useEffect } from "react";
import { Card } from "@/foundation/components/info/Card";
import Section from "@/foundation/components/sections/Section";
import Button from "@/foundation/components/buttons/Button";
import { useProfileAddresses } from "../../hooks/useAddress";

const AddressesPanel = () => {
  const { addresses, status, defaultAddress, loadAddresses, setDefaultAddress } =
    useProfileAddresses();

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  return (
    <Section title="Địa chỉ giao hàng">
      <Card className="space-y-4">
        <div className="text-sm text-neutral-6">Trạng thái: {status}</div>
        <div className="space-y-3">
          {addresses?.length ? (
            addresses.map((addr: import("@/core/api/addresses/type").Address) => (
              <div
                key={addr._id}
                className="flex items-start justify-between p-4 border rounded-xl border-border-2"
              >
                <div className="space-y-1">
                  <div className="font-medium">
                    {addr.name} {addr.phone ? `- ${addr.phone}` : ""}
                  </div>
                  <div className="text-neutral-6">
                    {addr.address}
                    {addr.ward ? `, ${addr.ward}` : ""}
                    {addr.district ? `, ${addr.district}` : ""}
                    {addr.city ? `, ${addr.city}` : ""}
                  </div>
                  {defaultAddress?._id === addr._id && (
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-primary-10 text-primary-6">
                      Mặc định
                    </span>
                  )}
                </div>
                {defaultAddress?._id !== addr._id && (
                  <Button size="sm" onClick={() => setDefaultAddress(addr._id)}>
                    Đặt mặc định
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div>Chưa có địa chỉ nào</div>
          )}
        </div>
      </Card>
    </Section>
  );
};

export default AddressesPanel;
