import { useEffect, useMemo, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { MapPin } from "lucide-react";
import Modal from "@/foundation/components/modal/Modal";
import ScrollView from "@/foundation/components/scroll/ScrollView";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import Button from "@/foundation/components/buttons/Button";
import Input from "@/foundation/components/input/Input";
import Checkbox from "@/foundation/components/input/Checkbox";
import AddressSelector from "@/shared/components/AddressSelector";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import FreeMap, { type MapCoordinates } from "@/foundation/components/map/FreeMap";
import addressData, { AddressProvince } from "@/shared/common/data-address/addressData";
import type { CreateAddressRequest } from "@/core/api/addresses/type";
import { useProfileAddresses } from "../../hooks/useAddress";

interface AddAddressModalProps {
  onClose: () => void;
}

const DEFAULT_MAP_CENTER: MapCoordinates = [20.9706, 105.7968];

const AddAddressModal = ({ onClose }: AddAddressModalProps) => {
  const { createAddress } = useProfileAddresses();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cityCode, setCityCode] = useState<number | "">("");
  const [districtCode, setDistrictCode] = useState<number | "">("");
  const [wardCode, setWardCode] = useState<number | "">("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [mapPosition, setMapPosition] = useState<MapCoordinates | null>(null);

  const provinces = addressData as AddressProvince[];

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
    if (!name || !phone || !cityCode || !districtCode || !wardCode) return;
    setIsSubmitting(true);
    try {
      const city = provinces.find((p) => p.code === cityCode)?.name || "";
      const district = districts.find((d) => d.code === districtCode)?.name || "";
      const ward = wards.find((w) => w.code === wardCode)?.name || "";
      const address: CreateAddressRequest = {
        name,
        phone,
        address: [addressLine2, addressLine1].filter(Boolean).join(" ").trim(),
        city,
        district,
        ward,
        isDefault,
        ...(mapPosition && { notes: JSON.stringify({ lat: mapPosition[0], lng: mapPosition[1] }) }),
      };
      createAddress(address);
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
      onConfirm={() => {
        handleSubmit();
      }}
      closeText="Hủy"
      confirmText={isSubmitting ? "Đang lưu..." : "Thêm địa chỉ"}
      disabled={isSubmitting}
      title={
        <div className="flex gap-3 items-center">
          <IconCircleWrapper size="md" color="info">
            <MapPin className="text-info" />
          </IconCircleWrapper>
          <div>
            <h2 className="text-xl font-bold text-neutral-9">Thêm địa chỉ mới</h2>
            <p className="text-sm text-neutral-6 mt-0.5">Quản lý nơi nhận hàng của bạn</p>
          </div>
        </div>
      }
      testId="profile-add-address-modal"
      headerPadding="pb-6"
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
              title="Hướng dẫn"
              message="Thông tin nhận hàng cần chính xác để hỗ trợ xác minh và giao nhận nhanh chóng."
            />

            <div className="grid grid-cols-1 gap-3">
              <Input
                name="address-fullname"
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                name="address-phone"
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
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
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  name="address-line-1"
                  label="Địa chỉ cụ thể"
                  placeholder="Xóm, đường..."
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                />
                <Input
                  name="address-line-2"
                  label="Số nhà"
                  placeholder="Số nhà"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                />
              </div>
              <Checkbox
                label="Đặt làm địa chỉ mặc định"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(Boolean(checked))}
                wrapperClassName="justify-start"
              />
            </div>

            {/* <div className="space-y-3 rounded-xl border border-neutral-3/60 bg-neutral-1 p-4 shadow-sm">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-9">Vị trí bản đồ (tuỳ chọn)</p>
                  <p className="text-xs text-neutral-6">Nhấp vào bản đồ để chọn vị trí giao hàng mong muốn.</p>
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

export default AddAddressModal;
