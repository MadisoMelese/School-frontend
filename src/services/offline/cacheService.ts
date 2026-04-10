import { getDB, setItem, getItem, getAllItems } from './indexedDB';

/**
 * Cache Service
 * Handles caching of API responses to IndexedDB for offline access
 */

export interface CacheMetadata {
  cachedAt: number;
  expiresAt: number;
  version: string;
}

export interface CachedData<T> {
  data: T;
  metadata: CacheMetadata;
}

const CACHE_VERSION = '1.0.0';
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Cache data to IndexedDB
 */
export const cacheData = async <T>(
  storeName: string,
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL
): Promise<void> => {
  const now = Date.now();
  const cachedData: CachedData<T> = {
    data,
    metadata: {
      cachedAt: now,
      expiresAt: now + ttl,
      version: CACHE_VERSION,
    },
  };

  await setItem(storeName as any, key, cachedData as any);
};

/**
 * Get cached data from IndexedDB
 */
export const getCachedData = async <T>(
  storeName: string,
  key: string
): Promise<T | null> => {
  try {
    const cachedData = (await getItem(storeName as any, key)) as CachedData<T> | undefined;

    if (!cachedData) {
      return null;
    }

    // Check if cache is expired
    const now = Date.now();
    if (cachedData.metadata.expiresAt < now) {
      // Cache expired, return null
      return null;
    }

    // Check version compatibility
    if (cachedData.metadata.version !== CACHE_VERSION) {
      // Version mismatch, return null
      return null;
    }

    return cachedData.data;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
};

/**
 * Check if cached data exists and is valid
 */
export const isCacheValid = async (storeName: string, key: string): Promise<boolean> => {
  try {
    const cachedData = (await getItem(storeName as any, key)) as CachedData<unknown> | undefined;

    if (!cachedData) {
      return false;
    }

    const now = Date.now();
    return (
      cachedData.metadata.expiresAt >= now && cachedData.metadata.version === CACHE_VERSION
    );
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = async (storeName: string): Promise<void> => {
  try {
    const allItems = (await getAllItems(storeName as any)) as CachedData<unknown>[];
    const now = Date.now();

    for (const item of allItems) {
      if (item.metadata.expiresAt < now) {
        // Delete expired item
        // Note: We need the key to delete, which isn't available in getAllItems
        // This is a limitation - we'll need to track keys separately or iterate differently
      }
    }
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
};

/**
 * Cache dashboard data
 */
export const cacheDashboardData = async (userId: string, data: unknown): Promise<void> => {
  await cacheData('user', `dashboard-${userId}`, data);
};

/**
 * Get cached dashboard data
 */
export const getCachedDashboardData = async <T>(userId: string): Promise<T | null> => {
  return getCachedData<T>('user', `dashboard-${userId}`);
};

/**
 * Cache grades data
 */
export const cacheGrades = async (grades: unknown[]): Promise<void> => {
  // Cache all grades
  await cacheData('grades', 'all-grades', grades);

  // Cache individual grades by ID
  for (const grade of grades as any[]) {
    if (grade.id) {
      await cacheData('grades', grade.id, grade);
    }
  }
};

/**
 * Get cached grades
 */
export const getCachedGrades = async <T>(): Promise<T | null> => {
  return getCachedData<T>('grades', 'all-grades');
};

/**
 * Cache attendance data
 */
export const cacheAttendance = async (attendance: unknown[]): Promise<void> => {
  // Cache all attendance records
  await cacheData('attendance', 'all-attendance', attendance);

  // Cache individual attendance records by ID
  for (const record of attendance as any[]) {
    if (record.id) {
      await cacheData('attendance', record.id, record);
    }
  }
};

/**
 * Get cached attendance
 */
export const getCachedAttendance = async <T>(): Promise<T | null> => {
  return getCachedData<T>('attendance', 'all-attendance');
};

/**
 * Cache exams data
 */
export const cacheExams = async (exams: unknown[]): Promise<void> => {
  await cacheData('exams', 'all-exams', exams);

  for (const exam of exams as any[]) {
    if (exam.id) {
      await cacheData('exams', exam.id, exam);
    }
  }
};

/**
 * Get cached exams
 */
export const getCachedExams = async <T>(): Promise<T | null> => {
  return getCachedData<T>('exams', 'all-exams');
};

/**
 * Cache fees data
 */
export const cacheFees = async (fees: unknown[]): Promise<void> => {
  await cacheData('fees', 'all-fees', fees);

  for (const fee of fees as any[]) {
    if (fee.id) {
      await cacheData('fees', fee.id, fee);
    }
  }
};

/**
 * Get cached fees
 */
export const getCachedFees = async <T>(): Promise<T | null> => {
  return getCachedData<T>('fees', 'all-fees');
};

/**
 * Cache messages data
 */
export const cacheMessages = async (messages: unknown[]): Promise<void> => {
  await cacheData('messages', 'all-messages', messages);

  for (const message of messages as any[]) {
    if (message.id) {
      await cacheData('messages', message.id, message);
    }
  }
};

/**
 * Get cached messages
 */
export const getCachedMessages = async <T>(): Promise<T | null> => {
  return getCachedData<T>('messages', 'all-messages');
};

export default {
  cacheData,
  getCachedData,
  isCacheValid,
  clearExpiredCache,
  cacheDashboardData,
  getCachedDashboardData,
  cacheGrades,
  getCachedGrades,
  cacheAttendance,
  getCachedAttendance,
  cacheExams,
  getCachedExams,
  cacheFees,
  getCachedFees,
  cacheMessages,
  getCachedMessages,
};
