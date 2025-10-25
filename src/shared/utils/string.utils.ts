// String utility functions
export const stringUtils = {
  /**
   * Capitalize the first letter of a string
   */
  capitalize: (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Convert string to camelCase
   */
  toCamelCase: (str: string): string => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  },

  /**
   * Convert string to kebab-case
   */
  toKebabCase: (str: string): string => {
    return str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  },

  /**
   * Convert string to snake_case
   */
  toSnakeCase: (str: string): string => {
    return str
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/[\s-]+/g, "_")
      .toLowerCase();
  },

  /**
   * Truncate string to specified length
   */
  truncate: (str: string, length: number, suffix: string = "..."): string => {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },

  /**
   * Remove HTML tags from string
   */
  stripHtml: (str: string): string => {
    return str.replace(/<[^>]*>/g, "");
  },

  /**
   * Check if string is empty or whitespace
   */
  isEmpty: (str: string): boolean => {
    return !str || str.trim().length === 0;
  },

  /**
   * Generate random string
   */
  randomString: (length: number = 10): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Format string with placeholders
   */
  format: (template: string, ...args: any[]): string => {
    return template.replace(/{(\d+)}/g, (match, index) => {
      return args[index] !== undefined ? args[index] : match;
    });
  },

  /**
   * Escape special regex characters
   */
  escapeRegex: (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  },

  /**
   * Check if string contains only digits
   */
  isNumeric: (str: string): boolean => {
    return /^\d+$/.test(str);
  },

  /**
   * Check if string is a valid email
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Check if string is a valid URL
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Remove duplicate characters from string
   */
  removeDuplicates: (str: string): string => {
    return [...new Set(str.split(""))].join("");
  },

  /**
   * Reverse string
   */
  reverse: (str: string): string => {
    return str.split("").reverse().join("");
  },

  /**
   * Count occurrences of substring
   */
  countOccurrences: (str: string, substring: string): number => {
    return (str.match(new RegExp(substring, "g")) || []).length;
  },

  /**
   * Pad string with character
   */
  pad: (str: string, length: number, char: string = " "): string => {
    if (str.length >= length) return str;
    const padLength = length - str.length;
    const padding = char.repeat(padLength);
    return str + padding;
  },

  /**
   * Pad string from left
   */
  padLeft: (str: string, length: number, char: string = " "): string => {
    if (str.length >= length) return str;
    const padLength = length - str.length;
    const padding = char.repeat(padLength);
    return padding + str;
  },

  /**
   * Pad string from right
   */
  padRight: (str: string, length: number, char: string = " "): string => {
    if (str.length >= length) return str;
    const padLength = length - str.length;
    const padding = char.repeat(padLength);
    return str + padding;
  },

  /**
   * Strip diacritics from string
   */
  stripDiacritics: (str: string): string => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  },

  /**
   * Strip special characters and unicode
   */
  stripSpecialCharactersUnicode: (str: string): string => {
    return str.replace(/[^\w\s]/gi, "");
  },

  /**
   * Mask phone number
   */
  maskPhone: (phone: string): string => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length <= 4) return cleaned;
    return cleaned.slice(0, -4).replace(/\d/g, "*") + cleaned.slice(-4);
  },

  /**
   * Convert Tailwind spacing to pixels
   */
  tailwindSpacingToPx: (spacing: string): number => {
    const spacingMap: Record<string, number> = {
      "0": 0,
      px: 1,
      "0.5": 2,
      "1": 4,
      "1.5": 6,
      "2": 8,
      "2.5": 10,
      "3": 12,
      "3.5": 14,
      "4": 16,
      "5": 20,
      "6": 24,
      "7": 28,
      "8": 32,
      "9": 36,
      "10": 40,
      "11": 44,
      "12": 48,
      "14": 56,
      "16": 64,
      "20": 80,
      "24": 96,
      "28": 112,
      "32": 128,
      "36": 144,
      "40": 160,
      "44": 176,
      "48": 192,
      "52": 208,
      "56": 224,
      "60": 240,
      "64": 256,
      "72": 288,
      "80": 320,
      "96": 384,
    };
    return spacingMap[spacing] || 0;
  },
};

// Export individual functions for easier imports
export const {
  capitalize,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  truncate,
  pad,
  padLeft,
  padRight,
  reverse,
  removeDuplicates,
  countOccurrences,
  escapeRegex,
  stripHtml,
  randomString,
  stripDiacritics,
  stripSpecialCharactersUnicode,
  maskPhone,
  tailwindSpacingToPx,
} = stringUtils;
