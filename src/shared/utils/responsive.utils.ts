/**
 * Responsive utility functions for handling responsive design
 */

/**
 * Converts pixels to rem units
 * @param px - Pixel value
 * @param baseFontSize - Base font size in pixels (default: 16)
 * @returns Rem value as string
 */
export const pxToRem = (px: number, baseFontSize: number = 16): string => {
  return `${px / baseFontSize}rem`;
};

/**
 * Converts rem to pixels
 * @param rem - Rem value
 * @param baseFontSize - Base font size in pixels (default: 16)
 * @returns Pixel value
 */
export const remToPx = (rem: number, baseFontSize: number = 16): number => {
  return rem * baseFontSize;
};

/**
 * Converts pixels to em units
 * @param px - Pixel value
 * @param baseFontSize - Base font size in pixels (default: 16)
 * @returns Em value as string
 */
export const pxToEm = (px: number, baseFontSize: number = 16): string => {
  return `${px / baseFontSize}em`;
};

/**
 * Converts em to pixels
 * @param em - Em value
 * @param baseFontSize - Base font size in pixels (default: 16)
 * @returns Pixel value
 */
export const emToPx = (em: number, baseFontSize: number = 16): number => {
  return em * baseFontSize;
};

/**
 * Converts pixels to viewport width units
 * @param px - Pixel value
 * @param viewportWidth - Viewport width in pixels (default: 1920)
 * @returns VW value as string
 */
export const pxToVw = (px: number, viewportWidth: number = 1920): string => {
  return `${(px / viewportWidth) * 100}vw`;
};

/**
 * Converts pixels to viewport height units
 * @param px - Pixel value
 * @param viewportHeight - Viewport height in pixels (default: 1080)
 * @returns VH value as string
 */
export const pxToVh = (px: number, viewportHeight: number = 1080): string => {
  return `${(px / viewportHeight) * 100}vh`;
};

/**
 * Converts pixels to viewport minimum units
 * @param px - Pixel value
 * @param viewportSize - Viewport size in pixels (default: 1080)
 * @returns VMin value as string
 */
export const pxToVmin = (px: number, viewportSize: number = 1080): string => {
  return `${(px / viewportSize) * 100}vmin`;
};

/**
 * Converts pixels to viewport maximum units
 * @param px - Pixel value
 * @param viewportSize - Viewport size in pixels (default: 1920)
 * @returns VMax value as string
 */
export const pxToVmax = (px: number, viewportSize: number = 1920): string => {
  return `${(px / viewportSize) * 100}vmax`;
};

/**
 * Responsive breakpoints for Tailwind CSS
 */
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

/**
 * Gets the current breakpoint based on window width
 * @param width - Window width in pixels
 * @returns Current breakpoint key
 */
export const getCurrentBreakpoint = (width: number): keyof typeof breakpoints => {
  if (width >= 1536) return "2xl";
  if (width >= 1280) return "xl";
  if (width >= 1024) return "lg";
  if (width >= 768) return "md";
  return "sm";
};

/**
 * Checks if current width matches breakpoint
 * @param width - Window width in pixels
 * @param breakpoint - Breakpoint to check
 * @returns True if width matches breakpoint
 */
export const matchesBreakpoint = (
  width: number,
  breakpoint: keyof typeof breakpoints
): boolean => {
  const breakpointValue = parseInt(breakpoints[breakpoint]);
  return width >= breakpointValue;
};

/**
 * Responsive font size calculator
 * @param minSize - Minimum font size in pixels
 * @param maxSize - Maximum font size in pixels
 * @param minWidth - Minimum viewport width in pixels
 * @param maxWidth - Maximum viewport width in pixels
 * @returns CSS clamp value
 */
export const responsiveFontSize = (
  minSize: number,
  maxSize: number,
  minWidth: number = 320,
  maxWidth: number = 1920
): string => {
  const minSizeRem = pxToRem(minSize);
  const maxSizeRem = pxToRem(maxSize);
  const minWidthRem = pxToRem(minWidth);
  const maxWidthRem = pxToRem(maxWidth);

  return `clamp(${minSizeRem}, ${minSizeRem} + (${maxSizeRem} - ${minSizeRem}) * ((100vw - ${minWidthRem}) / (${maxWidthRem} - ${minWidthRem})), ${maxSizeRem})`;
};

/**
 * Responsive spacing calculator
 * @param minSpacing - Minimum spacing in pixels
 * @param maxSpacing - Maximum spacing in pixels
 * @param minWidth - Minimum viewport width in pixels
 * @param maxWidth - Maximum viewport width in pixels
 * @returns CSS clamp value
 */
export const responsiveSpacing = (
  minSpacing: number,
  maxSpacing: number,
  minWidth: number = 320,
  maxWidth: number = 1920
): string => {
  const minSpacingRem = pxToRem(minSpacing);
  const maxSpacingRem = pxToRem(maxSpacing);
  const minWidthRem = pxToRem(minWidth);
  const maxWidthRem = pxToRem(maxWidth);

  return `clamp(${minSpacingRem}, ${minSpacingRem} + (${maxSpacingRem} - ${minSpacingRem}) * ((100vw - ${minWidthRem}) / (${maxWidthRem} - ${minWidthRem})), ${maxSpacingRem})`;
};

/**
 * Container max-width calculator
 * @param breakpoint - Breakpoint key
 * @returns Max width in pixels
 */
export const getContainerMaxWidth = (breakpoint: keyof typeof breakpoints): number => {
  const breakpointValues = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  };
  return breakpointValues[breakpoint];
};

/**
 * Aspect ratio calculator
 * @param width - Width value
 * @param height - Height value
 * @returns Aspect ratio percentage
 */
export const getAspectRatio = (width: number, height: number): string => {
  return `${(height / width) * 100}%`;
};

/**
 * Golden ratio calculator
 * @param base - Base value
 * @returns Golden ratio value
 */
export const goldenRatio = (base: number): number => {
  return base * 1.618;
};

/**
 * Modular scale calculator
 * @param base - Base value
 * @param ratio - Scale ratio (default: 1.25)
 * @param steps - Number of steps
 * @returns Array of scaled values
 */
export const modularScale = (
  base: number,
  ratio: number = 1.25,
  steps: number = 5
): number[] => {
  const scale: number[] = [];
  for (let i = 0; i < steps; i++) {
    scale.push(base * Math.pow(ratio, i));
  }
  return scale;
};


