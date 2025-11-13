declare module "./addressData" {
  export interface Ward {
    code: number;
    name: string;
  }
  export interface District {
    code: number;
    name: string;
    wards: Ward[];
  }
  export interface Province {
    code: number;
    name: string;
    districts: District[];
  }
  const addressData: Province[];
  export default addressData;
}
declare module "./common/addressData" {
  export interface Ward {
    code: number;
    name: string;
  }
  export interface District {
    code: number;
    name: string;
    wards: Ward[];
  }
  export interface Province {
    code: number;
    name: string;
    districts: District[];
  }
  const addressData: Province[];
  export default addressData;
}







