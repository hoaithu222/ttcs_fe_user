// Market constants
export const MARKET_CONSTANTS = {
  // Market types
  TYPES: {
    STOCK: "stock",
    BOND: "bond",
    COMMODITY: "commodity",
    FOREX: "forex",
    CRYPTO: "crypto",
    DERIVATIVE: "derivative",
  },

  // Market status
  STATUS: {
    OPEN: "open",
    CLOSED: "closed",
    PRE_MARKET: "pre_market",
    AFTER_HOURS: "after_hours",
    SUSPENDED: "suspended",
  },

  // Trading sessions
  SESSIONS: {
    MORNING: "morning",
    AFTERNOON: "afternoon",
    EVENING: "evening",
    NIGHT: "night",
  },

  // Order types
  ORDER_TYPES: {
    MARKET: "market",
    LIMIT: "limit",
    STOP: "stop",
    STOP_LIMIT: "stop_limit",
    TRAILING_STOP: "trailing_stop",
  },

  // Order sides
  ORDER_SIDES: {
    BUY: "buy",
    SELL: "sell",
    SHORT: "short",
    COVER: "cover",
  },

  // Time in force
  TIME_IN_FORCE: {
    DAY: "day",
    GTC: "gtc", // Good Till Cancelled
    IOC: "ioc", // Immediate or Cancel
    FOK: "fok", // Fill or Kill
  },

  // Market data fields
  DATA_FIELDS: {
    SYMBOL: "symbol",
    PRICE: "price",
    VOLUME: "volume",
    CHANGE: "change",
    CHANGE_PERCENT: "change_percent",
    HIGH: "high",
    LOW: "low",
    OPEN: "open",
    CLOSE: "close",
    PREVIOUS_CLOSE: "previous_close",
    MARKET_CAP: "market_cap",
    PE_RATIO: "pe_ratio",
    DIVIDEND_YIELD: "dividend_yield",
    BETA: "beta",
    EPS: "eps",
    BOOK_VALUE: "book_value",
    PRICE_TO_BOOK: "price_to_book",
    PRICE_TO_SALES: "price_to_sales",
    RETURN_ON_EQUITY: "return_on_equity",
    RETURN_ON_ASSETS: "return_on_assets",
    DEBT_TO_EQUITY: "debt_to_equity",
    CURRENT_RATIO: "current_ratio",
    QUICK_RATIO: "quick_ratio",
    CASH_RATIO: "cash_ratio",
    GROSS_MARGIN: "gross_margin",
    OPERATING_MARGIN: "operating_margin",
    NET_MARGIN: "net_margin",
    REVENUE_GROWTH: "revenue_growth",
    EARNINGS_GROWTH: "earnings_growth",
    ANALYST_RATING: "analyst_rating",
    TARGET_PRICE: "target_price",
    RECOMMENDATION: "recommendation",
  },

  // Market colors
  COLORS: {
    UP: "#10B981", // green
    DOWN: "#EF4444", // red
    NEUTRAL: "#6B7280", // gray
    VOLUME: "#3B82F6", // blue
    HIGH: "#F59E0B", // yellow
    LOW: "#8B5CF6", // purple
  },

  // Market symbols
  SYMBOLS: {
    UP_ARROW: "↑",
    DOWN_ARROW: "↓",
    NEUTRAL: "→",
    VOLUME: "📊",
    PRICE: "💰",
    CHANGE: "📈",
  },

  // Market intervals
  INTERVALS: {
    MINUTE_1: "1m",
    MINUTE_5: "5m",
    MINUTE_15: "15m",
    MINUTE_30: "30m",
    HOUR_1: "1h",
    HOUR_4: "4h",
    DAY_1: "1d",
    WEEK_1: "1w",
    MONTH_1: "1M",
  },

  // Market exchanges
  EXCHANGES: {
    NYSE: "NYSE",
    NASDAQ: "NASDAQ",
    AMEX: "AMEX",
    OTC: "OTC",
    LSE: "LSE",
    TSE: "TSE",
    HKEX: "HKEX",
    SSE: "SSE",
    SZSE: "SZSE",
  },

  // Market sectors
  SECTORS: {
    TECHNOLOGY: "technology",
    HEALTHCARE: "healthcare",
    FINANCIAL: "financial",
    CONSUMER_DISCRETIONARY: "consumer_discretionary",
    CONSUMER_STAPLES: "consumer_staples",
    INDUSTRIALS: "industrials",
    ENERGY: "energy",
    MATERIALS: "materials",
    REAL_ESTATE: "real_estate",
    UTILITIES: "utilities",
    COMMUNICATION: "communication",
  },

  // Market indices
  INDICES: {
    SP500: "SP500",
    DOW_JONES: "DOW_JONES",
    NASDAQ_COMPOSITE: "NASDAQ_COMPOSITE",
    RUSSELL_2000: "RUSSELL_2000",
    VIX: "VIX",
    GOLD: "GOLD",
    SILVER: "SILVER",
    OIL: "OIL",
    BITCOIN: "BITCOIN",
    ETHEREUM: "ETHEREUM",
  },
};

// Market codes for Vietnamese markets
export const MarketCd = {
  HOSE: "HOSE",
  HNX: "HNX",
  UPCOM: "UPCOM",
  DERIVATIVES: "DERIVATIVES",
  BOND: "BOND",
  CW: "CW",
  DER: "DER",
  // Additional market codes
  DER_IDX: "DER_IDX",
  HSX_IDX: "HSX_IDX",
  HNX_IDX: "HNX_IDX",
  UPCOM_IDX: "UPCOM_IDX",
} as const;

export type MarketCode = (typeof MarketCd)[keyof typeof MarketCd];

export const convertMarketCdToText = (marketCd: MarketCode, short?: boolean): string => {
  switch (marketCd) {
    case MarketCd.HOSE:
      return short ? "HOSE" : "Ho Chi Minh Stock Exchange";
    case MarketCd.HNX:
      return short ? "HNX" : "Hanoi Stock Exchange";
    case MarketCd.UPCOM:
      return short ? "UPCOM" : "Unlisted Public Company Market";
    case MarketCd.DERIVATIVES:
      return short ? "DER" : "Derivatives";
    case MarketCd.BOND:
      return short ? "BOND" : "Bond Market";
    case MarketCd.CW:
      return short ? "CW" : "Covered Warrant";
    case MarketCd.DER:
      return short ? "DER" : "Derivatives";
    case MarketCd.DER_IDX:
      return short ? "DER_IDX" : "Derivatives Index";
    case MarketCd.HSX_IDX:
      return short ? "HSX_IDX" : "HOSE Index";
    case MarketCd.HNX_IDX:
      return short ? "HNX_IDX" : "HNX Index";
    case MarketCd.UPCOM_IDX:
      return short ? "UPCOM_IDX" : "UPCOM Index";
    default:
      return marketCd;
  }
};

// Export individual constants for backward compatibility
export const MarketType = MARKET_CONSTANTS.TYPES;
export const MarketStatus = MARKET_CONSTANTS.STATUS;
export const OrderType = MARKET_CONSTANTS.ORDER_TYPES;
export const OrderSide = MARKET_CONSTANTS.ORDER_SIDES;
export const TimeInForce = MARKET_CONSTANTS.TIME_IN_FORCE;
export const MarketDataField = MARKET_CONSTANTS.DATA_FIELDS;
export const MarketColor = MARKET_CONSTANTS.COLORS;
export const MarketSymbol = MARKET_CONSTANTS.SYMBOLS;
export const MarketInterval = MARKET_CONSTANTS.INTERVALS;
export const MarketExchange = MARKET_CONSTANTS.EXCHANGES;
export const MarketSector = MARKET_CONSTANTS.SECTORS;
export const MarketIndex = MARKET_CONSTANTS.INDICES;
