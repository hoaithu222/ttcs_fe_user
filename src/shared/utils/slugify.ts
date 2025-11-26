/**
 * Convert a string to a URL-friendly slug
 * @param text - The text to slugify
 * @param separator - The separator to use (default: '-')
 * @returns The slugified string
 */
export function slugify(text: string, separator: string = "-"): string {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, separator) // Replace spaces and underscores with separator
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing separators
}

