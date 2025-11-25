export interface Level3 {
  level3_id: string;
  name: string;
  type: string;
}

export interface Level2 {
  level2_id: string;
  name: string;
  type: string;
  level3s: Level3[];
}

export interface Level1 {
  level1_id: string;
  name: string;
  type: string;
  level2s: Level2[];
}

export interface DVHCData {
  data: Level1[];
}

export interface AddressWard {
  code: number;
  codeRaw: string;
  name: string;
  type: string;
}

export interface AddressDistrict {
  code: number;
  codeRaw: string;
  name: string;
  type: string;
  wards: AddressWard[];
}

export interface AddressProvince {
  code: number;
  codeRaw: string;
  name: string;
  type: string;
  districts: AddressDistrict[];
}
