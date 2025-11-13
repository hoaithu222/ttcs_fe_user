import { useEffect, useMemo, useState } from "react";
import { Card } from "@/foundation/components/info/Card";
import Button from "@/foundation/components/buttons/Button";
import addressData from "./common/addressData";
import type { Address, UpdateAddressRequest } from "@/core/api/addresses/type";
import { useProfileAddresses } from "../../hooks/useAddress";

interface EditAddressModalProps {
  address: Address;
  onClose: () => void;
}

const EditAddressModal = ({ address, onClose }: EditAddressModalProps) => {
  const { updateAddress } = useProfileAddresses();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState(address.name);
  const [phone, setPhone] = useState(address.phone);
  const [cityCode, setCityCode] = useState<number | "">("");
  const [districtCode, setDistrictCode] = useState<number | "">("");
  const [wardCode, setWardCode] = useState<number | "">("");
  const [addressLine1, setAddressLine1] = useState(address.address || "");

  const provinces = addressData as Array<{
    code: number;
    name: string;
    districts: Array<{ code: number; name: string; wards: Array<{ code: number; name: string }> }>;
  }>;

  // Preselect codes by name matching if possible
  useEffect(() => {
    const province = provinces.find((p) => p.name === address.city);
    if (province) {
      setCityCode(province.code);
      const district = province.districts.find((d) => d.name === address.district);
      if (district) {
        setDistrictCode(district.code);
        const ward = district.wards.find((w) => w.name === (address as any).ward);
        if (ward) setWardCode(ward.code);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const districts = useMemo(() => {
    const province = provinces.find((p) => p.code === cityCode);
    return province?.districts || [];
  }, [cityCode, provinces]);

  const wards = useMemo(() => {
    const district = districts.find((d) => d.code === districtCode);
    return district?.wards || [];
  }, [districts, districtCode]);

  useEffect(() => {
    setDistrictCode("");
    setWardCode("");
  }, [cityCode]);

  useEffect(() => {
    setWardCode("");
  }, [districtCode]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const city = cityCode
        ? provinces.find((p) => p.code === cityCode)?.name || address.city
        : address.city;
      const district = districtCode
        ? districts.find((d) => d.code === districtCode)?.name || address.district
        : address.district;
      const ward = wardCode ? wards.find((w) => w.code === wardCode)?.name || (address as any).ward : (address as any).ward;
      const data: UpdateAddressRequest = {
        _id: address._id,
        name,
        phone,
        address: addressLine1,
        city,
        district,
        ward,
      };
      updateAddress(address._id, data);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-[90%] max-w-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Cập nhật địa chỉ</div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Đóng
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <div className="text-xs font-medium text-neutral-5">Họ và tên</div>
            <input
              className="w-full px-3 py-2 mt-1 border rounded-lg border-border-2 bg-background-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-5">Số điện thoại</div>
            <input
              className="w-full px-3 py-2 mt-1 border rounded-lg border-border-2 bg-background-1"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <select
              className="w-full px-3 py-2 border rounded-lg border-border-2 bg-background-1"
              value={cityCode}
              onChange={(e) => setCityCode(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Chọn Tỉnh/Thành phố</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              className="w-full px-3 py-2 border rounded-lg border-border-2 bg-background-1"
              value={districtCode}
              onChange={(e) => setDistrictCode(e.target.value ? Number(e.target.value) : "")}
              disabled={!cityCode}
            >
              <option value="">Chọn Quận/Huyện</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              className="w-full px-3 py-2 border rounded-lg border-border-2 bg-background-1"
              value={wardCode}
              onChange={(e) => setWardCode(e.target.value ? Number(e.target.value) : "")}
              disabled={!districtCode}
            >
              <option value="">Chọn Phường/Xã</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-5">Địa chỉ</div>
            <input
              className="w-full px-3 py-2 mt-1 border rounded-lg border-border-2 bg-background-1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Cập nhật"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EditAddressModal;








