import { useEffect, useMemo, useState } from "react";
import { Card } from "@/foundation/components/info/Card";
import Section from "@/foundation/components/sections/Section";
import Button from "@/foundation/components/buttons/Button";
import { useProfileAddresses } from "../../hooks/useAddress";
import type { Address } from "@/core/api/addresses/type";
import AddAddressModal from "./AddAddressModal";
import EditAddressModal from "./EditAddressModal";

const AddressesPanel = () => {
  const { addresses, status, defaultAddress, loadAddresses, setDefaultAddress } =
    useProfileAddresses();
  const { deleteAddress } = useProfileAddresses();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Address | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const sortedAddresses = useMemo(() => {
    const list = Array.isArray(addresses) ? [...addresses] : [];
    return list.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  }, [addresses]);

  return (
    <Section title="Địa chỉ giao hàng">
      <Card className="space-y-4">
        <div className="flex justify-between items-center">
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            Thêm địa chỉ
          </Button>
        </div>
        <div className="space-y-3">
          {sortedAddresses?.length ? (
            sortedAddresses.map((addr) => (
              <div
                key={addr._id}
                className="flex justify-between items-start p-4 rounded-xl border border-border-2"
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
                  {addr.isDefault && (
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-primary-1 text-primary-6">
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  {!addr.isDefault && (
                    <Button size="sm" onClick={() => setDefaultAddress(addr._id)}>
                      Đặt mặc định
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setEditTarget(addr)}>
                    Sửa
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeleteTarget(addr)}>
                    Xóa
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div>Chưa có địa chỉ nào</div>
          )}
        </div>
      </Card>
      {isAddOpen && <AddAddressModal onClose={() => setIsAddOpen(false)} />}
      {editTarget && <EditAddressModal address={editTarget} onClose={() => setEditTarget(null)} />}
      {deleteTarget && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50">
          <Card className="w-[90%] max-w-sm space-y-4">
            <div className="text-lg font-semibold">Xóa địa chỉ</div>
            <div className="text-sm">
              Bạn có chắc muốn xóa địa chỉ của "{deleteTarget.name}" không?
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Hủy
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  deleteAddress(deleteTarget._id);
                  setDeleteTarget(null);
                }}
              >
                Xóa
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Section>
  );
};

export default AddressesPanel;
