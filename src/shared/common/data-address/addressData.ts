import rawData from "./dvhcvn.json";
import type { DVHCData, AddressProvince } from "./type";
export type { AddressProvince, AddressDistrict, AddressWard } from "./type";

const normalizeCode = (code: string) => Number(code);

const { data } = rawData as DVHCData;

const normalized: AddressProvince[] = data.map((province) => ({
  code: normalizeCode(province.level1_id),
  codeRaw: province.level1_id,
  name: province.name,
  type: province.type,
  districts: province.level2s.map((district) => ({
    code: normalizeCode(district.level2_id),
    codeRaw: district.level2_id,
    name: district.name,
    type: district.type,
    wards: district.level3s.map((ward) => ({
      code: normalizeCode(ward.level3_id),
      codeRaw: ward.level3_id,
      name: ward.name,
      type: ward.type,
    })),
  })),
}));

export default normalized;

