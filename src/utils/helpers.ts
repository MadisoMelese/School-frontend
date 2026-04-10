/**
 * General Helper Functions
 */

/**
 * Check if value is empty
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Merge objects
 */
export const mergeObjects = <T extends Record<string, unknown>>(...objects: Partial<T>[]): T => {
  return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {} as Partial<T>) as T;
};

/**
 * Get value from nested object
 */
export const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
};

/**
 * Set value in nested object
 */
export const setNestedValue = (
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void => {
  const keys = path.split('.');
  const lastKey = keys.pop();

  if (!lastKey) return;

  let current = obj;
  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[lastKey] = value;
};

/**
 * Flatten nested object
 */
export const flattenObject = (
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, unknown> => {
  const flattened: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      flattened[newKey] = value;
    }
  }

  return flattened;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
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
};

/**
 * Retry function with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Check if object is empty
 */
export const isObjectEmpty = (obj: Record<string, unknown>): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Get object keys with type safety
 */
export const getObjectKeys = <T extends Record<string, unknown>>(obj: T): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[];
};

/**
 * Filter object by keys
 */
export const filterObjectByKeys = <T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> => {
  const filtered: Partial<T> = {};

  for (const key of keys) {
    if (key in obj) {
      filtered[key] = obj[key];
    }
  }

  return filtered;
};

/**
 * Omit keys from object
 */
export const omitKeys = <T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> => {
  const result: Partial<T> = { ...obj };

  for (const key of keys) {
    delete result[key];
  }

  return result;
};

/**
 * Pick keys from object
 */
export const pickKeys = <T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> => {
  return filterObjectByKeys(obj, keys);
};

/**
 * Group array by key
 */
export const groupBy = <T extends Record<string, unknown>>(
  array: T[],
  key: keyof T
): Record<string, T[]> => {
  return array.reduce(
    (acc, item) => {
      const groupKey = String(item[key]);
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
};

/**
 * Sort array by key
 */
export const sortBy = <T extends Record<string, unknown>>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Unique array values
 */
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

/**
 * Unique array by key
 */
export const uniqueBy = <T extends Record<string, unknown>>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

/**
 * Chunk array
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Flatten array
 */
export const flatten = <T>(array: (T | T[])[]): T[] => {
  return array.reduce((acc: T[], item) => {
    if (Array.isArray(item)) {
      acc.push(...(item as T[]));
    } else {
      acc.push(item as T);
    }
    return acc;
  }, [] as T[]);
};

/**
 * Wait for condition
 */
export const waitFor = async (
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> => {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
};

export default {
  isEmpty,
  deepClone,
  mergeObjects,
  getNestedValue,
  setNestedValue,
  flattenObject,
  debounce,
  throttle,
  retry,
  generateId,
  generateUUID,
  isObjectEmpty,
  getObjectKeys,
  filterObjectByKeys,
  omitKeys,
  pickKeys,
  groupBy,
  sortBy,
  unique,
  uniqueBy,
  chunk,
  flatten,
  waitFor,
};
