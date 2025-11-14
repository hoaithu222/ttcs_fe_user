import { useEffect, useMemo, useState } from "react";
import Select from "@/foundation/components/input/Select";
import type {
  Province,
  District,
  Ward,
} from "@/features/Profile/components/address/common/addressData";
import addressData from "@/features/Profile/components/address/common/addressData";

export interface AddressSelectorValue {
  provinceCode?: number | "";
  districtCode?: number | "";
  wardCode?: number | "";
}

export interface AddressSelectorProps {
  value?: AddressSelectorValue;
  onChange?: (value: AddressSelectorValue) => void;
  labels?: {
    province?: string;
    district?: string;
    ward?: string;
  };
  disabled?: boolean;
  className?: string;
}

/**
 * AddressSelector
 * Reusable 3-level selector (Province → District → Ward) based on shared addressData.
 */
const AddressSelector = ({
  value,
  onChange,
  labels,
  disabled,
  className,
}: AddressSelectorProps) => {
  const [provinceCode, setProvinceCode] = useState<number | "">(value?.provinceCode ?? "");
  const [districtCode, setDistrictCode] = useState<number | "">(value?.districtCode ?? "");
  const [wardCode, setWardCode] = useState<number | "">(value?.wardCode ?? "");

  // Sync external value
  useEffect(() => {
    if (!value) return;
    if (value.provinceCode !== undefined) setProvinceCode(value.provinceCode);
    if (value.districtCode !== undefined) setDistrictCode(value.districtCode);
    if (value.wardCode !== undefined) setWardCode(value.wardCode);
  }, [value?.provinceCode, value?.districtCode, value?.wardCode]);

  // Reset lower levels on change
  useEffect(() => {
    setDistrictCode("");
    setWardCode("");
  }, [provinceCode]);

  useEffect(() => {
    setWardCode("");
  }, [districtCode]);

  const provinces = addressData as Province[];
  const districts = useMemo<District[]>(() => {
    const p = provinces.find((x) => x.code === provinceCode);
    return p?.districts || [];
  }, [provinceCode, provinces]);

  const wards = useMemo<Ward[]>(() => {
    const d = districts.find((x) => x.code === districtCode);
    return d?.wards || [];
  }, [districts, districtCode]);

  // Emit change
  useEffect(() => {
    onChange?.({ provinceCode, districtCode, wardCode });
  }, [provinceCode, districtCode, wardCode, onChange]);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Select
          name="province"
          label={labels?.province ?? "Tỉnh/Thành phố"}
          placeholder="Chọn Tỉnh/Thành phố"
          value={provinceCode ? String(provinceCode) : undefined}
          searchable
          onChange={(v) => setProvinceCode(v ? Number(v) : "")}
          options={provinces.map((p) => ({ value: String(p.code), label: p.name }))}
          disabled={disabled}
          required
          className="overflow-y-auto max-h-40"
          customHeight={"max-h-40 overflow-y-auto"}
        />

        <Select
          name="district"
          label={labels?.district ?? "Quận/Huyện"}
          placeholder="Chọn Quận/Huyện"
          value={districtCode ? String(districtCode) : undefined}
          searchable
          onChange={(v) => setDistrictCode(v ? Number(v) : "")}
          options={districts.map((d) => ({ value: String(d.code), label: d.name }))}
          disabled={disabled || !provinceCode}
          required
          customHeight={"max-h-40 overflow-y-auto"}
        />

        <Select
          name="ward"
          label={labels?.ward ?? "Phường/Xã"}
          placeholder="Chọn Phường/Xã"
          value={wardCode ? String(wardCode) : undefined}
          searchable
          onChange={(v) => setWardCode(v ? Number(v) : "")}
          options={wards.map((w) => ({ value: String(w.code), label: w.name }))}
          disabled={disabled || !districtCode}
          required
          customHeight={"max-h-40 overflow-y-auto"}
        />
      </div>
    </div>
  );
};

export default AddressSelector;
