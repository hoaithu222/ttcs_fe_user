import numeral from "numeral";

import { EMarketCodeNew, SecType } from "@/shared/constants/consts";
import GlobalData from "@/shared/utils/global-data";

const regPrice = /^\d+(\.\d{0,9})?$/;

const UNIT_NUMBER = {
  ONE_HUNDRED: 100,
  ONE_THOUSAND: 1000,
  TEN_THOUSAND: 10000,
  ONE_HUNDRED_THOUSAND: 100000,
  ONE_MILLION: 1000000,
  ONE_BILLION: 1000000000,
};

export const incrementPrice = (
  symbol: string,
  price: number | string,
  max?: number,
  min?: number,
  isOneNumberAfterComma?: boolean,
  isBond?: boolean
): number | string => {
  if (!symbol) {
    return price;
  }

  if (!regPrice.test(price as string) && numeral(price).value() === null) {
    if (price === "") {
      price = 0;
    } else {
      return price;
    }
  }

  price = numeral(price).value()!;

  if (min) {
    if (price === 0) {
      price = numeral(min).value()!;
      return price;
    }
  }

  // Parse sang number
  let resultPrice: number = Number(price);

  if (isBond) {
    // Bước giá 100đ
    if (Math.round(Number(resultPrice * 1000) + Number.EPSILON) % 1 === 0) {
      resultPrice = Math.round((resultPrice + Number.EPSILON) * 1000) / 1000;
      resultPrice = resultPrice + 0.001;
      return Math.round((resultPrice + Number.EPSILON) * 1000) / 1000;
    } else {
      return Math.ceil((resultPrice + Number.EPSILON) * 1000) / 1000;
    }
  }

  if (max && resultPrice >= max) return resultPrice;

  // Tính chưa
  let isCal = false;
  // Có phải mã phái sinh không
  let isDer = false;
  // Bước giá 1đ không
  let isStep1 = false;

  if (isOneNumberAfterComma) {
    const ticker = GlobalData.getTickerInfoNew(symbol);
    resultPrice = resultPrice + 0.1;
    isCal = true;
    if (ticker != null && ticker.marketCd === EMarketCodeNew.DER_IDX) {
      isDer = true;
    }
  } else {
    if (symbol) {
      const ticker = GlobalData.getTickerInfoNew(symbol);

      if (ticker !== null && ticker?.marketCd === EMarketCodeNew.HSX_IDX) {
        // Mã chứng quyền và ETF
        if (ticker.secType === SecType.CW || ticker.secType === SecType.E) {
          resultPrice = Math.round((resultPrice + Number.EPSILON) * 100) / 100;
          resultPrice = resultPrice + 0.01;
          isCal = true;
        } else {
          if (resultPrice < 10.0) {
            resultPrice = Math.round((resultPrice + Number.EPSILON) * 100) / 100;
            resultPrice = resultPrice + 0.01;
          } else if (resultPrice >= 10.0 && resultPrice < 49.95) {
            resultPrice = Math.round((resultPrice + Number.EPSILON) * 20) / 20;
            resultPrice = resultPrice + 0.05;
          } else if (resultPrice >= 49.5 && resultPrice < 50.0) {
            resultPrice = 50.0;
          } else if (resultPrice >= 50.0) {
            resultPrice = Math.round((resultPrice + Number.EPSILON) * 10) / 10;
            resultPrice = resultPrice + 0.1;
          } else {
            resultPrice = Math.round((resultPrice + Number.EPSILON) * 10) / 10;
            resultPrice = resultPrice + 0.1;
          }
          isCal = true;
        }
      }

      if (
        ticker !== null &&
        (ticker?.marketCd === EMarketCodeNew.HNX_IDX ||
          ticker?.marketCd === EMarketCodeNew.UPCOM_IDX)
      ) {
        // Bước giá 1đ
        if (ticker?.secType === SecType.E || ticker?.secType === SecType.D) {
          resultPrice = Math.round((resultPrice + Number.EPSILON) * 1000) / 1000;
          resultPrice = resultPrice + 0.001;
          isCal = true;
          isStep1 = true;
        }
      }

      if (ticker != null && ticker.marketCd === EMarketCodeNew.DER_IDX) {
        isDer = true;
      }
    }
  }

  if (!isCal) {
    resultPrice = Math.round((resultPrice + Number.EPSILON) * 10) / 10;
    resultPrice = resultPrice + 0.1;
  }

  if (isDer) {
    resultPrice = Math.round((resultPrice + Number.EPSILON) * 10) / 10;
  } else {
    if (isStep1) {
      resultPrice = Math.round((resultPrice + Number.EPSILON) * 1000) / 1000;
    } else {
      resultPrice = Math.round((resultPrice + Number.EPSILON) * 100) / 100;
    }
  }

  if (resultPrice <= 0) resultPrice = 0;

  return resultPrice;
};

// Nhấn nút - Giá
export const decrementPrice = (
  symbol: string,
  price: number | string,
  min?: number,
  isOneNumberAfterComma?: boolean,
  isBond?: boolean
): number | string => {
  if (!symbol) {
    return price;
  }

  if (!regPrice.test(price as string) && numeral(price).value() === null) {
    if (price === "") {
      price = 0;
    } else {
      return price;
    }
  }

  price = numeral(price).value()!;
  if (min) {
    if (price === 0) {
      price = numeral(min).value()!;
      return price;
    }
  }

  // Parse sang number
  let resultPrice: number = Number(price);

  if (isBond) {
    // Bước giá 100đ
    if (Math.round(Number(resultPrice * 1000) + Number.EPSILON) % 1 === 0) {
      resultPrice = Math.round((resultPrice + Number.EPSILON) * 1000) / 1000;
      resultPrice = resultPrice - 0.001;
      return Math.round((resultPrice + Number.EPSILON) * 1000) / 1000;
    } else {
      return Math.floor((resultPrice + Number.EPSILON) * 1000) / 1000;
    }
  }

  if (min && resultPrice <= min) return resultPrice;

  // Tính chưa
  let isCal = false;
  // Có phải mã phái sinh không
  let isDer = false;
  // Bước giá 1đ không
  let isStep1 = false;

  if (isOneNumberAfterComma) {
    const ticker = GlobalData.getTickerInfoNew(symbol);
    resultPrice = resultPrice - 0.1;
    isCal = true;
    if (ticker != null && ticker.marketCd === EMarketCodeNew.DER_IDX) {
      isDer = true;
    }
  } else {
    if (symbol) {
      const ticker = GlobalData.getTickerInfoNew(symbol);
      if (ticker !== null && ticker?.marketCd === EMarketCodeNew.HSX_IDX) {
        // Mã chứng quyền và ETF
        if (ticker.secType === SecType.CW || ticker.secType === SecType.E) {
          // Bước giá 10đ
          resultPrice = Math.round((resultPrice + Number.EPSILON) * 100) / 100;
          resultPrice = resultPrice - 0.01;
          isCal = true;
        } else {
          if (resultPrice <= 10.0) {
            // Bước giá 10đ
            resultPrice = Math.round((resultPrice + Number.EPSILON) * 100) / 100;
            resultPrice = resultPrice - 0.01;
          } else if (resultPrice > 10.0 && resultPrice <= 49.95) {
            // Bước giá 50đ
            resultPrice = Math.round((resultPrice + Number.EPSILON) * 20) / 20;
            resultPrice = resultPrice - 0.05;
          } else if (resultPrice === 50.0) {
            resultPrice = 49.95;
          } else if (resultPrice > 50.0 && resultPrice < 50.1) {
            resultPrice = 50.0;
          } else if (resultPrice > 50.1) {
            // Bước giá 100đ
            resultPrice = Math.round((resultPrice + Number.EPSILON) * 10) / 10;
            resultPrice = resultPrice - 0.1;
          } else {
            // Bước giá 100đ
            resultPrice = Math.round((resultPrice + Number.EPSILON) * 10) / 10;
            resultPrice = resultPrice - 0.1;
          }
          isCal = true;
        }
      }

      if (
        ticker !== null &&
        (ticker?.marketCd === EMarketCodeNew.HNX_IDX ||
          ticker?.marketCd === EMarketCodeNew.UPCOM_IDX)
      ) {
        // Bước giá 1đ
        if (ticker?.secType === SecType.E || ticker?.secType === SecType.D) {
          resultPrice = Math.round((resultPrice + Number.EPSILON) * 1000) / 1000;
          resultPrice = resultPrice - 0.001;
          isCal = true;
          isStep1 = true;
        }
      }

      if (ticker != null && ticker?.marketCd === EMarketCodeNew.DER_IDX) {
        isDer = true;
      }
    }
  }

  if (!isCal) {
    resultPrice = Math.round((resultPrice + Number.EPSILON) * 10) / 10;
    resultPrice = resultPrice - 0.1;
  }

  if (isDer) {
    resultPrice = Math.round((resultPrice + Number.EPSILON) * 10) / 10;
  } else {
    if (isStep1) {
      resultPrice = Math.round((resultPrice + Number.EPSILON) * 1000) / 1000;
    } else {
      resultPrice = Math.round((resultPrice + Number.EPSILON) * 100) / 100;
    }
  }

  if (resultPrice <= 0) resultPrice = 0;

  return resultPrice;
};

export const incrementPtPrice = (
  symbol: string,
  price: number | string,
  max?: number,
  min?: number
): number | string => {
  if (!symbol) {
    return price;
  }

  if (!regPrice.test(price as string) && numeral(price).value() === null) {
    if (price === "") {
      price = 0;
    } else {
      return price;
    }
  }

  price = numeral(price).value()!;

  // const ticker = GlobalData.getTickerInfoNew(symbol);

  if (min && price === 0) return min;

  let resultPrice: number = Number(price);

  if (max && resultPrice >= max) return resultPrice;

  return Math.round((resultPrice + 0.001) * UNIT_NUMBER.ONE_THOUSAND) / UNIT_NUMBER.ONE_THOUSAND;
};

// Nhấn nút - Giá
export const decrementPtPrice = (
  symbol: string,
  price: number | string,
  min?: number
): number | string => {
  if (!symbol) {
    return price;
  }

  if (!regPrice.test(price as string) && numeral(price).value() === null) {
    if (price === "") {
      price = 0;
    } else {
      return price;
    }
  }

  price = numeral(price).value()!;

  if (min && price === 0) return min;

  let resultPrice: number = Number(price);

  if (min && resultPrice <= min) return resultPrice;

  return Math.round((resultPrice - 0.001) * UNIT_NUMBER.ONE_THOUSAND) / UNIT_NUMBER.ONE_THOUSAND;
};
