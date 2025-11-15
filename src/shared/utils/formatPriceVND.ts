/**
 * Format price to VND currency format
 * @param price - Price in number
 * @returns Formatted price string (e.g., "1.000.000 ₫")
 */
export const formatPriceVND = (price: number | string | undefined | null): string => {
  if (price === undefined || price === null || price === "") return "0 ₫";
  
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0 ₫";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numPrice);
};

export default formatPriceVND;

