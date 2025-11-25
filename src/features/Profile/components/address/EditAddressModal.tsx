import { useEffect, useMemo, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { MapPin } from "lucide-react";
import Modal from "@/foundation/components/modal/Modal";
import ScrollView from "@/foundation/components/scroll/ScrollView";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import Button from "@/foundation/components/buttons/Button";
import Input from "@/foundation/components/input/Input";
import AddressSelector from "@/shared/components/AddressSelector";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import FreeMap, { type MapCoordinates } from "@/foundation/components/map/FreeMap";
import addressData, { AddressProvince } from "@/shared/common/data-address/addressData";
import type { Address, UpdateAddressRequest } from "@/core/api/addresses/type";
import { useProfileAddresses } from "../../hooks/useAddress";

interface EditAddressModalProps {
  address: Address;
  onClose: () => void;
}

const DEFAULT_MAP_CENTER: MapCoordinates = [20.9706, 105.7968];

const parseLocationNote = (note?: string): MapCoordinates | null => {
  if (!note) return null;
  try {
    const parsed = JSON.parse(note);
    if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") {
      return [parsed.lat, parsed.lng];
    }
  } catch {
    // ignore invalid json
  }
  return null;
};

const EditAddressModal = ({ address, onClose }: EditAddressModalProps) => {
  const { updateAddress } = useProfileAddresses();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState(address.name);
  const [phone, setPhone] = useState(address.phone);
  const [cityCode, setCityCode] = useState<number | "">("");
  const [districtCode, setDistrictCode] = useState<number | "">("");
  const [wardCode, setWardCode] = useState<number | "">("");
  const [addressLine1, setAddressLine1] = useState(address.address || "");
  const [mapPosition, setMapPosition] = useState<MapCoordinates | null>(() => parseLocationNote(address.notes));

  const provinces = addressData as AddressProvince[];

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

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const city = cityCode
        ? provinces.find((p) => p.code === cityCode)?.name || address.city
        : address.city;
      const district = districtCode
        ? districts.find((d) => d.code === districtCode)?.name || address.district
        : address.district;
      const ward = wardCode
        ? wards.find((w) => w.code === wardCode)?.name || (address as any).ward
        : (address as any).ward;
      const data: UpdateAddressRequest = {
        _id: address._id,
        name,
        phone,
        address: addressLine1,
        city,
        district,
        ward,
        ...(mapPosition && { notes: JSON.stringify({ lat: mapPosition[0], lng: mapPosition[1] }) }),
      };
      updateAddress(address._id, data);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const coordinateLabel = mapPosition
    ? `${mapPosition[0].toFixed(5)}, ${mapPosition[1].toFixed(5)}`
    : "Chưa chọn vị trí";

  return (
    <Modal
      open
      size="3xl"
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      onCancel={handleClose}
      onConfirm={handleSubmit}
      closeText="Hủy"
      confirmText={isSubmitting ? "Đang lưu..." : "Cập nhật"}
      disabled={isSubmitting}
      title={
        <div className="flex gap-3 items-center">
          <IconCircleWrapper size="md" color="info">
            <MapPin className="text-info" />
          </IconCircleWrapper>
          <div>
            <h2 className="text-xl font-bold text-neutral-9">Cập nhật địa chỉ</h2>
            <p className="text-sm text-neutral-6 mt-0.5">Điều chỉnh thông tin giao nhận</p>
          </div>
        </div>
      }
      testId="profile-edit-address-modal"
      className="flex flex-col gap-6"
    >
      <Form.Root
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <ScrollView className="h-[520px]" hideScrollbarY={false}>
          <div className="space-y-6 pr-1">
            <AlertMessage
              type="info"
              title="Kiểm tra lại trước khi lưu"
              message="Các thay đổi áp dụng cho những đơn hàng tiếp theo. Hãy đảm bảo thông tin vẫn còn hiệu lực."
            />
            <div className="grid grid-cols-1 gap-3">
              <Input
                name="edit-address-name"
                label="Họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                name="edit-address-phone"
                label="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="numeric"
                required
              />
              <AddressSelector
                value={{ provinceCode: cityCode, districtCode, wardCode }}
                onChange={(val) => {
                  setCityCode((val.provinceCode ?? "") as number | "");
                  setDistrictCode((val.districtCode ?? "") as number | "");
                  setWardCode((val.wardCode ?? "") as number | "");
                }}
                labels={{
                  province: "Tỉnh/Thành phố",
                  district: "Quận/Huyện",
                  ward: "Phường/Xã",
                }}
              />
              <Input
                name="edit-address-detail"
                label="Địa chỉ"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Nhập địa chỉ chi tiết"
              />
            </div>

            {/* <div className="space-y-3 rounded-xl border border-neutral-3/60 bg-neutral-1 p-4 shadow-sm">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-9">Vị trí bản đồ (tuỳ chọn)</p>
                  <p className="text-xs text-neutral-6">Nhấp vào bản đồ để điều chỉnh vị trí giao hàng.</p>
                </div>
                {mapPosition && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setMapPosition(null)}
                    className="self-start md:self-auto"
                  >
                    Xóa vị trí
                  </Button>
                )}
              </div>
              <FreeMap
                center={mapPosition ?? DEFAULT_MAP_CENTER}
                markerPosition={mapPosition}
                onMarkerChange={setMapPosition}
                popupContent="Địa điểm giao hàng"
                className="h-[280px] rounded-lg"
              />
              <p className="text-xs text-neutral-6">
                Tọa độ hiện tại: <span className="font-semibold text-neutral-9">{coordinateLabel}</span>
              </p>
            </div> */}
            <Form.Submit asChild>
              <button type="submit" className="hidden" aria-hidden />
            </Form.Submit>
          </div>
        </ScrollView>
      </Form.Root>
    </Modal>
  );
};

export default EditAddressModal;











