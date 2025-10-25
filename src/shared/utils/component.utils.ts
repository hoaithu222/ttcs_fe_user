import React from "react";

// Component utility functions
export const componentUtils = {
  /**
   * Generate unique ID for components
   */
  generateId: (prefix: string = "id"): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Check if element is visible in viewport
   */
  isInViewport: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * Scroll element into view
   */
  scrollIntoView: (element: HTMLElement, options?: ScrollIntoViewOptions): void => {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
      ...options,
    });
  },

  /**
   * Get element position relative to viewport
   */
  getElementPosition: (
    element: HTMLElement
  ): { top: number; left: number; bottom: number; right: number } => {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
    };
  },

  /**
   * Add event listener with cleanup
   */
  addEventListener: (
    element: HTMLElement | Window | Document,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): (() => void) => {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  },

  /**
   * Debounce function
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Clone object deeply
   */
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map((item) => componentUtils.deepClone(item)) as T;
    if (typeof obj === "object") {
      const clonedObj = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = componentUtils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  },

  /**
   * Merge objects deeply
   */
  deepMerge: <T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T => {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key] || !isObject(target[key])) {
            Object.assign(target, { [key]: {} });
          }
          componentUtils.deepMerge(target[key] as any, source[key] as any);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return componentUtils.deepMerge(target, ...sources);
  },

  /**
   * Check if value is object
   */
  isObject: (item: any): boolean => {
    return item && typeof item === "object" && !Array.isArray(item);
  },

  /**
   * Get nested property value
   */
  getNestedValue: (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  },

  /**
   * Set nested property value
   */
  setNestedValue: (obj: any, path: string, value: any): void => {
    const keys = path.split(".");
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    if (lastKey) target[lastKey] = value;
  },

  /**
   * Format class names
   */
  classNames: (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(" ");
  },

  /**
   * Generate CSS custom properties
   */
  generateCSSVariables: (variables: Record<string, string | number>): string => {
    return Object.entries(variables)
      .map(([key, value]) => `--${key}: ${value};`)
      .join(" ");
  },

  /**
   * Check if element has class
   */
  hasClass: (element: HTMLElement, className: string): boolean => {
    return element.classList.contains(className);
  },

  /**
   * Add class to element
   */
  addClass: (element: HTMLElement, className: string): void => {
    element.classList.add(className);
  },

  /**
   * Remove class from element
   */
  removeClass: (element: HTMLElement, className: string): void => {
    element.classList.remove(className);
  },

  /**
   * Toggle class on element
   */
  toggleClass: (element: HTMLElement, className: string): void => {
    element.classList.toggle(className);
  },

  /**
   * Get computed style value
   */
  getComputedStyleValue: (element: HTMLElement, property: string): string => {
    return window.getComputedStyle(element).getPropertyValue(property);
  },

  /**
   * Set CSS custom property
   */
  setCSSVariable: (element: HTMLElement, property: string, value: string): void => {
    element.style.setProperty(`--${property}`, value);
  },

  /**
   * Get CSS custom property
   */
  getCSSVariable: (element: HTMLElement, property: string): string => {
    return element.style.getPropertyValue(`--${property}`);
  },

  /**
   * Enhance icon with additional properties
   */
  enhanceIcon: (icon: React.ReactNode, props: Record<string, any>): React.ReactNode => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, { ...props });
    }
    return icon;
  },
};

// Export individual functions for easier imports
export const {
  generateId,
  scrollIntoView,
  getElementPosition,
  deepClone,
  deepMerge,
  isObject,
  getNestedValue,
  setNestedValue,
  classNames,
  enhanceIcon,
} = componentUtils;
