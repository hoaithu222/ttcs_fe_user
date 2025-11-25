import addressData, {
  AddressProvince,
  AddressDistrict,
  AddressWard,
} from "@/shared/common/data-address/addressData";

export interface AddressCodes {
  provinceCode?: number | "";
  districtCode?: number | "";
  wardCode?: number | "";
}

const provinces = addressData as AddressProvince[];

const findProvinceByCode = (code?: number | ""): AddressProvince | undefined => {
  if (typeof code !== "number") return undefined;
  return provinces.find((province) => province.code === code);
};

const findDistrictByCode = ({
  districtCode,
  provinceCode,
}: AddressCodes): AddressDistrict | undefined => {
  if (typeof districtCode !== "number") return undefined;

  const province =
    findProvinceByCode(provinceCode) ||
    provinces.find((p) => p.districts.some((district) => district.code === districtCode));

  return province?.districts.find((district) => district.code === districtCode);
};

const findWardByCode = ({
  wardCode,
  districtCode,
  provinceCode,
}: AddressCodes): AddressWard | undefined => {
  if (typeof wardCode !== "number") return undefined;

  const district =
    findDistrictByCode({ districtCode, provinceCode }) ||
    provinces
      .flatMap((province) => province.districts)
      .find((d) => d.wards.some((ward) => ward.code === wardCode));

  return district?.wards.find((ward) => ward.code === wardCode);
};

export const getAddressNamesFromCodes = (codes?: AddressCodes | null) => {
  if (!codes) {
    return {
      provinceName: undefined,
      districtName: undefined,
      wardName: undefined,
    };
  }

  const province = findProvinceByCode(codes.provinceCode);
  const district = findDistrictByCode(codes);
  const ward = findWardByCode(codes);

  return {
    provinceName: province?.name,
    districtName: district?.name,
    wardName: ward?.name,
  };
};

export const formatAddressFromCodes = (
  codes?: AddressCodes | null,
  fallback = "Chưa cập nhật"
) => {
  const { wardName, districtName, provinceName } = getAddressNamesFromCodes(codes);
  const parts = [wardName, districtName, provinceName].filter(Boolean);
  return parts.length ? parts.join(", ") : fallback;
};

