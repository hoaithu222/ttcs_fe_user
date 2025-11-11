import { useEffect, useMemo, useState } from "react";
import { Card } from "@/foundation/components/info/Card";
import Button from "@/foundation/components/buttons/Button";
import addressData from "./common/addressData";
import type { CreateAddressRequest } from "@/core/api/addresses/type";
import { useProfileAddresses } from "../../hooks/useAddress";
import MapPickerModal from "./MapPickerModal";

interface AddAddressModalProps {
  onClose: () => void;
}

const AddAddressModal = ({ onClose }: AddAddressModalProps) => {
  const { createAddress } = useProfileAddresses();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cityCode, setCityCode] = useState<number | "">("");
  const [districtCode, setDistrictCode] = useState<number | "">("");
  const [wardCode, setWardCode] = useState<number | "">("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const provinces = addressData as Array<{
    code: number;
    name: string;
    districts: Array<{ code: number; name: string; wards: Array<{ code: number; name: string }> }>;
  }>;

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
    if (!name || !phone || !cityCode || !districtCode || !wardCode) return;
    setIsSubmitting(true);
    try {
      const city = provinces.find((p) => p.code === cityCode)?.name || "";
      const district = districts.find((d) => d.code === districtCode)?.name || "";
      const ward = wards.find((w) => w.code === wardCode)?.name || "";
      const address: CreateAddressRequest = {
        name,
        phone,
        address: [addressLine2, addressLine1].filter(Boolean).join(" "),
        city,
        district,
        ward,
        isDefault,
      };
      createAddress(address);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50">
      <Card className="w-[90%] max-w-xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">Thêm địa chỉ mới</div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Đóng
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <div className="text-xs font-medium text-neutral-5">Họ và tên</div>
            <input
              className="px-3 py-2 mt-1 w-full rounded-lg border border-border-2 bg-background-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên"
            />
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-5">Số điện thoại</div>
            <input
              className="px-3 py-2 mt-1 w-full rounded-lg border border-border-2 bg-background-1"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="numeric"
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <select
              className="px-3 py-2 w-full rounded-lg border border-border-2 bg-background-1"
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
              className="px-3 py-2 w-full rounded-lg border border-border-2 bg-background-1"
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
              className="px-3 py-2 w-full rounded-lg border border-border-2 bg-background-1"
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-neutral-5">Địa chỉ cụ thể</div>
              <input
                className="px-3 py-2 mt-1 w-full rounded-lg border border-border-2 bg-background-1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Xóm, đường..."
              />
            </div>
            <div>
              <div className="text-xs font-medium text-neutral-5">Số nhà</div>
              <input
                className="px-3 py-2 mt-1 w-full rounded-lg border border-border-2 bg-background-1"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Số nhà"
              />
            </div>
          </div>
          <label className="inline-flex gap-2 items-center">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <span className="text-sm">Đặt làm địa chỉ mặc định</span>
          </label>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="outline" onClick={() => setIsMapOpen(true)}>
            Chọn trên bản đồ
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Thêm địa chỉ"}
          </Button>
        </div>
        <MapPickerModal
          open={isMapOpen}
          initialCoords={pickedCoords}
          onCancel={() => setIsMapOpen(false)}
          onSelect={(coords) => {
            setPickedCoords(coords);
            // Gợi ý địa chỉ chi tiết bằng lat/lng (có thể thay bằng reverse geocode sau)
            setAddressLine1(`Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`);
            setIsMapOpen(false);
          }}
        />
      </Card>
    </div>
  );
};

export default AddAddressModal;
