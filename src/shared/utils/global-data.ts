// Global data utilities
export const globalData: {
  // User data
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    role: string | null;
    permissions: string[];
  };

  // Market data
  market: {
    isOpen: boolean;
    currentTime: Date;
    lastUpdate: Date;
    indices: Record<string, any>;
    sectors: Record<string, any>;
  };

  // Application state
  app: {
    theme: "light" | "dark";
    language: string;
    notifications: any[];
    settings: Record<string, any>;
  };

  // Cache
  cache: {
    data: Map<string, any>;
    timestamps: Map<string, number>;
    ttl: number;
  };

  // Methods
  setUser: (userData: Partial<typeof globalData.user>) => void;
  setMarket: (marketData: Partial<typeof globalData.market>) => void;
  setApp: (appData: Partial<typeof globalData.app>) => void;
  setCache: (key: string, value: any, ttl?: number) => void;
  getCache: (key: string) => any;
  clearCache: () => void;
  isLoggedIn: () => boolean;
  hasPermission: (permission: string) => boolean;
  isMarketOpen: () => boolean;
  getCurrentTime: () => Date;
  updateMarketTime: () => void;
  getTickerInfoNew: (symbol: string) => any;
  events: Map<string, Set<Function>>;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
  emit: (event: string, data?: any) => void;
  storage: {
    set: (key: string, value: any) => void;
    get: (key: string) => any;
    remove: (key: string) => void;
    clear: () => void;
  };
} = {
  // User data
  user: {
    id: null as string | null,
    name: null as string | null,
    email: null as string | null,
    role: null as string | null,
    permissions: [] as string[],
  },

  // Market data
  market: {
    isOpen: false,
    currentTime: new Date(),
    lastUpdate: new Date(),
    indices: {} as Record<string, any>,
    sectors: {} as Record<string, any>,
  },

  // Application state
  app: {
    theme: "light" as "light" | "dark",
    language: "en" as string,
    notifications: [] as any[],
    settings: {} as Record<string, any>,
  },

  // Cache
  cache: {
    data: new Map<string, any>(),
    timestamps: new Map<string, number>(),
    ttl: 300000, // 5 minutes
  },

  // Methods
  setUser: (userData: Partial<typeof globalData.user>) => {
    Object.assign(globalData.user, userData);
  },

  setMarket: (marketData: Partial<typeof globalData.market>) => {
    Object.assign(globalData.market, marketData);
  },

  setApp: (appData: Partial<typeof globalData.app>) => {
    Object.assign(globalData.app, appData);
  },

  setCache: (key: string, value: any, ttl?: number) => {
    globalData.cache.data.set(key, value);
    globalData.cache.timestamps.set(key, Date.now());
    if (ttl) {
      setTimeout(() => {
        globalData.cache.data.delete(key);
        globalData.cache.timestamps.delete(key);
      }, ttl);
    }
  },

  getCache: (key: string) => {
    const timestamp = globalData.cache.timestamps.get(key);
    if (timestamp && Date.now() - timestamp > globalData.cache.ttl) {
      globalData.cache.data.delete(key);
      globalData.cache.timestamps.delete(key);
      return null;
    }
    return globalData.cache.data.get(key);
  },

  clearCache: () => {
    globalData.cache.data.clear();
    globalData.cache.timestamps.clear();
  },

  // Utility methods
  isLoggedIn: () => {
    return !!globalData.user.id;
  },

  hasPermission: (permission: string) => {
    return globalData.user.permissions.includes(permission);
  },

  isMarketOpen: () => {
    return globalData.market.isOpen;
  },

  getCurrentTime: () => {
    return globalData.market.currentTime;
  },

  updateMarketTime: () => {
    globalData.market.currentTime = new Date();
    globalData.market.lastUpdate = new Date();
  },

  getTickerInfoNew: (symbol: string) => {
    // Mock implementation - replace with actual API call
    return {
      symbol,
      price: 100,
      change: 0,
      changePercent: 0,
      volume: 1000000,
      high: 105,
      low: 95,
      open: 100,
      close: 100,
      marketCap: 1000000000,
      pe: 15,
      eps: 6.67,
      dividend: 2.5,
      yield: 2.5,
      beta: 1.0,
      sector: "Technology",
      industry: "Software",
      employees: 10000,
      founded: 2010,
      headquarters: "San Francisco, CA",
      website: "https://example.com",
      description: "A technology company",
      ceo: "John Doe",
      cfo: "Jane Smith",
      revenue: 1000000000,
      profit: 100000000,
      assets: 2000000000,
      liabilities: 500000000,
      equity: 1500000000,
      cash: 200000000,
      debt: 300000000,
      bookValue: 150,
      priceToBook: 0.67,
      priceToSales: 1.0,
      returnOnEquity: 6.67,
      returnOnAssets: 5.0,
      debtToEquity: 0.2,
      currentRatio: 2.0,
      quickRatio: 1.5,
      grossMargin: 0.8,
      operatingMargin: 0.2,
      netMargin: 0.1,
      revenueGrowth: 0.1,
      earningsGrowth: 0.15,
      analystRating: "Buy",
      targetPrice: 120,
      recommendation: "Strong Buy",
      lastUpdate: new Date(),
    };
  },

  // Event system
  events: new Map<string, Set<Function>>(),

  on: (event: string, callback: Function) => {
    if (!globalData.events.has(event)) {
      globalData.events.set(event, new Set());
    }
    globalData.events.get(event)?.add(callback);
  },

  off: (event: string, callback: Function) => {
    globalData.events.get(event)?.delete(callback);
  },

  emit: (event: string, data?: any) => {
    globalData.events.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  },

  // Storage
  storage: {
    set: (key: string, value: any) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error("Error setting localStorage:", error);
      }
    },

    get: (key: string) => {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error("Error getting localStorage:", error);
        return null;
      }
    },

    remove: (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error("Error removing localStorage:", error);
      }
    },

    clear: () => {
      try {
        localStorage.clear();
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
    },
  },
};

export default globalData;
