/**
 * Color utility functions for handling Tailwind CSS colors
 */

/**
 * Converts Tailwind CSS color class to hex value
 * @param colorClass - Tailwind color class (e.g., "text-blue-600", "bg-red-500")
 * @returns Hex color value
 */
export const getTailwindHexColor = (colorClass: string): string => {
  // Extract color and shade from class name
  const colorMatch = colorClass.match(/(?:text-|bg-|border-)?([a-z]+)-(\d+)/);

  if (!colorMatch) {
    return "currentColor";
  }

  const [, colorName, shade] = colorMatch;

  // Color mappings for common Tailwind colors
  const colorMap: Record<string, Record<string, string>> = {
    // Gray scale
    gray: {
      "50": "#f9fafb",
      "100": "#f3f4f6",
      "200": "#e5e7eb",
      "300": "#d1d5db",
      "400": "#9ca3af",
      "500": "#6b7280",
      "600": "#4b5563",
      "700": "#374151",
      "800": "#1f2937",
      "900": "#111827",
      "950": "#030712",
    },
    // Blue scale
    blue: {
      "50": "#eff6ff",
      "100": "#dbeafe",
      "200": "#bfdbfe",
      "300": "#93c5fd",
      "400": "#60a5fa",
      "500": "#3b82f6",
      "600": "#2563eb",
      "700": "#1d4ed8",
      "800": "#1e40af",
      "900": "#1e3a8a",
      "950": "#172554",
    },
    // Red scale
    red: {
      "50": "#fef2f2",
      "100": "#fee2e2",
      "200": "#fecaca",
      "300": "#fca5a5",
      "400": "#f87171",
      "500": "#ef4444",
      "600": "#dc2626",
      "700": "#b91c1c",
      "800": "#991b1b",
      "900": "#7f1d1d",
      "950": "#450a0a",
    },
    // Green scale
    green: {
      "50": "#f0fdf4",
      "100": "#dcfce7",
      "200": "#bbf7d0",
      "300": "#86efac",
      "400": "#4ade80",
      "500": "#22c55e",
      "600": "#16a34a",
      "700": "#15803d",
      "800": "#166534",
      "900": "#14532d",
      "950": "#052e16",
    },
    // Yellow scale
    yellow: {
      "50": "#fefce8",
      "100": "#fef3c7",
      "200": "#fde68a",
      "300": "#fcd34d",
      "400": "#fbbf24",
      "500": "#f59e0b",
      "600": "#d97706",
      "700": "#b45309",
      "800": "#92400e",
      "900": "#78350f",
      "950": "#451a03",
    },
    // Orange scale
    orange: {
      "50": "#fff7ed",
      "100": "#ffedd5",
      "200": "#fed7aa",
      "300": "#fdba74",
      "400": "#fb923c",
      "500": "#f97316",
      "600": "#ea580c",
      "700": "#c2410c",
      "800": "#9a3412",
      "900": "#7c2d12",
      "950": "#431407",
    },
    // Purple scale
    purple: {
      "50": "#faf5ff",
      "100": "#f3e8ff",
      "200": "#e9d5ff",
      "300": "#d8b4fe",
      "400": "#c084fc",
      "500": "#a855f7",
      "600": "#9333ea",
      "700": "#7c3aed",
      "800": "#6b21a8",
      "900": "#581c87",
      "950": "#3b0764",
    },
    // Pink scale
    pink: {
      "50": "#fdf2f8",
      "100": "#fce7f3",
      "200": "#fbcfe8",
      "300": "#f9a8d4",
      "400": "#f472b6",
      "500": "#ec4899",
      "600": "#db2777",
      "700": "#be185d",
      "800": "#9d174d",
      "900": "#831843",
      "950": "#500724",
    },
    // Indigo scale
    indigo: {
      "50": "#eef2ff",
      "100": "#e0e7ff",
      "200": "#c7d2fe",
      "300": "#a5b4fc",
      "400": "#818cf8",
      "500": "#6366f1",
      "600": "#4f46e5",
      "700": "#4338ca",
      "800": "#3730a3",
      "900": "#312e81",
      "950": "#1e1b4b",
    },
    // Cyan scale
    cyan: {
      "50": "#ecfeff",
      "100": "#cffafe",
      "200": "#a5f3fc",
      "300": "#67e8f9",
      "400": "#22d3ee",
      "500": "#06b6d4",
      "600": "#0891b2",
      "700": "#0e7490",
      "800": "#155e75",
      "900": "#164e63",
      "950": "#083344",
    },
    // Teal scale
    teal: {
      "50": "#f0fdfa",
      "100": "#ccfbf1",
      "200": "#99f6e4",
      "300": "#5eead4",
      "400": "#2dd4bf",
      "500": "#14b8a6",
      "600": "#0d9488",
      "700": "#0f766e",
      "800": "#115e59",
      "900": "#134e4a",
      "950": "#042f2e",
    },
    // Emerald scale
    emerald: {
      "50": "#ecfdf5",
      "100": "#d1fae5",
      "200": "#a7f3d0",
      "300": "#6ee7b7",
      "400": "#34d399",
      "500": "#10b981",
      "600": "#059669",
      "700": "#047857",
      "800": "#065f46",
      "900": "#064e3b",
      "950": "#022c22",
    },
    // Lime scale
    lime: {
      "50": "#f7fee7",
      "100": "#ecfccb",
      "200": "#d9f99d",
      "300": "#bef264",
      "400": "#a3e635",
      "500": "#84cc16",
      "600": "#65a30d",
      "700": "#4d7c0f",
      "800": "#3f6212",
      "900": "#365314",
      "950": "#1a2e05",
    },
    // Rose scale
    rose: {
      "50": "#fff1f2",
      "100": "#ffe4e6",
      "200": "#fecdd3",
      "300": "#fda4af",
      "400": "#fb7185",
      "500": "#f43f5e",
      "600": "#e11d48",
      "700": "#be123c",
      "800": "#9f1239",
      "900": "#881337",
      "950": "#4c0519",
    },
    // Neutral scale
    neutral: {
      "0": "#ffffff",
      "1": "#fafafa",
      "2": "#f5f5f5",
      "3": "#f0f0f0",
      "4": "#e5e5e5",
      "5": "#d4d4d4",
      "6": "#a3a3a3",
      "7": "#737373",
      "8": "#525252",
      "9": "#404040",
      "10": "#262626",
      "11": "#171717",
      "12": "#0a0a0a",
      "13": "#000000",
    },
    // Base colors
    base: {
      white: "#ffffff",
      black: "#000000",
    },
  };

  // Handle special cases
  if (colorName === "white" || colorName === "black") {
    return colorMap.base[colorName] || "currentColor";
  }

  // Handle neutral scale
  if (colorName === "neutral") {
    return colorMap.neutral[shade] || "currentColor";
  }

  // Get color from map
  const colorShades = colorMap[colorName];
  if (!colorShades) {
    return "currentColor";
  }

  return colorShades[shade] || "currentColor";
};

/**
 * Converts hex color to RGB values
 * @param hex - Hex color string
 * @returns RGB object or null if invalid
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Converts RGB to hex color
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Gets contrast color (black or white) for given background color
 * @param backgroundColor - Background color in hex format
 * @returns "black" or "white"
 */
export const getContrastColor = (backgroundColor: string): "black" | "white" => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return "black";

  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "black" : "white";
};

/**
 * Generates a random color
 * @returns Random hex color
 */
export const getRandomColor = (): string => {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
};

/**
 * Darkens a color by a given percentage
 * @param hex - Hex color string
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened hex color
 */
export const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;
  return rgbToHex(
    Math.round(rgb.r * factor),
    Math.round(rgb.g * factor),
    Math.round(rgb.b * factor)
  );
};

/**
 * Lightens a color by a given percentage
 * @param hex - Hex color string
 * @param percent - Percentage to lighten (0-100)
 * @returns Lightened hex color
 */
export const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;
  return rgbToHex(
    Math.round(rgb.r + (255 - rgb.r) * factor),
    Math.round(rgb.g + (255 - rgb.g) * factor),
    Math.round(rgb.b + (255 - rgb.b) * factor)
  );
};

/**
 * Get stock color by code
 * @param code - Stock code
 * @returns Color string
 */
export const getStockColorByCode = (code: string): string => {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];
  const index = code.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * Get stock color by price comparison
 * @param price - Current price
 * @param previousPrice - Previous price
 * @returns Color string
 */
export const getStockColorByPrice = (price: number, previousPrice: number): string => {
  if (price > previousPrice) return "#10B981"; // green
  if (price < previousPrice) return "#EF4444"; // red
  return "#6B7280"; // gray
};
