import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  cacheData,
  getCachedData,
  isCacheValid,
  cacheDashboardData,
  getCachedDashboardData,
  cacheGrades,
  getCachedGrades,
  cacheAttendance,
  getCachedAttendance,
} from './cacheService';
import * as indexedDB from './indexedDB';

vi.mock('./indexedDB');

describe('Cache Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cacheData', () => {
    it('should cache data with metadata', async () => {
      const mockSetItem = vi.spyOn(indexedDB, 'setItem').mockResolvedValue();
      const testData = { id: '1', name: 'Test' };

      await cacheData('grades', 'test-key', testData);

      expect(mockSetItem).toHaveBeenCalledWith(
        'grades',
        'test-key',
        expect.objectContaining({
          data: testData,
          metadata: expect.objectContaining({
            cachedAt: expect.any(Number),
            expiresAt: expect.any(Number),
            version: '1.0.0',
          }),
        })
      );
    });

    it('should use custom TTL when provided', async () => {
      const mockSetItem = vi.spyOn(indexedDB, 'setItem').mockResolvedValue();
      const testData = { id: '1', name: 'Test' };
      const customTTL = 1000; // 1 second

      await cacheData('grades', 'test-key', testData, customTTL);

      expect(mockSetItem).toHaveBeenCalledWith(
        'grades',
        'test-key',
        expect.objectContaining({
          data: testData,
          metadata: expect.objectContaining({
            expiresAt: expect.any(Number),
          }),
        })
      );

      const call = mockSetItem.mock.calls[0];
      const cachedData = call[2] as any;
      const ttl = cachedData.metadata.expiresAt - cachedData.metadata.cachedAt;
      expect(ttl).toBe(customTTL);
    });
  });

  describe('getCachedData', () => {
    it('should return cached data if valid', async () => {
      const testData = { id: '1', name: 'Test' };
      const cachedData = {
        data: testData,
        metadata: {
          cachedAt: Date.now(),
          expiresAt: Date.now() + 10000, // Expires in 10 seconds
          version: '1.0.0',
        },
      };

      vi.spyOn(indexedDB, 'getItem').mockResolvedValue(cachedData as any);

      const result = await getCachedData('grades', 'test-key');

      expect(result).toEqual(testData);
    });

    it('should return null if cache is expired', async () => {
      const testData = { id: '1', name: 'Test' };
      const cachedData = {
        data: testData,
        metadata: {
          cachedAt: Date.now() - 20000,
          expiresAt: Date.now() - 10000, // Expired 10 seconds ago
          version: '1.0.0',
        },
      };

      vi.spyOn(indexedDB, 'getItem').mockResolvedValue(cachedData as any);

      const result = await getCachedData('grades', 'test-key');

      expect(result).toBeNull();
    });

    it('should return null if version mismatch', async () => {
      const testData = { id: '1', name: 'Test' };
      const cachedData = {
        data: testData,
        metadata: {
          cachedAt: Date.now(),
          expiresAt: Date.now() + 10000,
          version: '0.9.0', // Old version
        },
      };

      vi.spyOn(indexedDB, 'getItem').mockResolvedValue(cachedData as any);

      const result = await getCachedData('grades', 'test-key');

      expect(result).toBeNull();
    });

    it('should return null if no cached data exists', async () => {
      vi.spyOn(indexedDB, 'getItem').mockResolvedValue(undefined);

      const result = await getCachedData('grades', 'test-key');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(indexedDB, 'getItem').mockRejectedValue(new Error('DB Error'));

      const result = await getCachedData('grades', 'test-key');

      expect(result).toBeNull();
    });
  });

  describe('isCacheValid', () => {
    it('should return true for valid cache', async () => {
      const cachedData = {
        data: { id: '1' },
        metadata: {
          cachedAt: Date.now(),
          expiresAt: Date.now() + 10000,
          version: '1.0.0',
        },
      };

      vi.spyOn(indexedDB, 'getItem').mockResolvedValue(cachedData as any);

      const result = await isCacheValid('grades', 'test-key');

      expect(result).toBe(true);
    });

    it('should return false for expired cache', async () => {
      const cachedData = {
        data: { id: '1' },
        metadata: {
          cachedAt: Date.now() - 20000,
          expiresAt: Date.now() - 10000,
          version: '1.0.0',
        },
      };

      vi.spyOn(indexedDB, 'getItem').mockResolvedValue(cachedData as any);

      const result = await isCacheValid('grades', 'test-key');

      expect(result).toBe(false);
    });

    it('should return false for version mismatch', async () => {
      const cachedData = {
        data: { id: '1' },
        metadata: {
          cachedAt: Date.now(),
          expiresAt: Date.now() + 10000,
          version: '0.9.0',
        },
      };

      vi.spyOn(indexedDB, 'getItem').mockResolvedValue(cachedData as any);

      const result = await isCacheValid('grades', 'test-key');

      expect(result).toBe(false);
    });

    it('should return false if no cache exists', async () => {
      vi.spyOn(indexedDB, 'getItem').mockResolvedValue(undefined);

      const result = await isCacheValid('grades', 'test-key');

      expect(result).toBe(false);
    });
  });

  describe('cacheDashboardData', () => {
    it('should cache dashboard data with user ID', async () => {
      const mockSetItem = vi.spyOn(indexedDB, 'setItem').mockResolvedValue();
      const dashboardData = { grades: [], attendance: [] };

      await cacheDashboardData('user-123', dashboardData);

      expect(mockSetItem).toHaveBeenCalledWith(
        'user',
        'dashboard-user-123',
        expect.objectContaining({
          data: dashboardData,
        })
      );
    });
  });

  describe('getCachedDashboardData', () => {
    it('should retrieve cached dashboard data', async () => {
      const dashboardData = { grades: [], attendance: [] };
      const cachedData = {
        data: dashboardData,
        metadata: {
          cachedAt: Date.now(),
          expiresAt: Date.now() + 10000,
          version: '1.0.0',
        },
      };

      vi.spyOn(indexedDB, 'getItem').mockResolvedValue(cachedData as any);

      const result = await getCachedDashboardData('user-123');

      expect(result).toEqual(dashboardData);
    });
  });

  describe('cacheGrades', () => {
    it('should cache all grades and individual grades', async () => {
      const mockSetItem = vi.spyOn(indexedDB, 'setItem').mockResolvedValue();
      const grades = [
        { id: '1', subject: 'Math', marks: 85 },
        { id: '2', subject: 'English', marks: 90 },
      ];

      await cacheGrades(grades);

      // Should cache all grades
      expect(mockSetItem).toHaveBeenCalledWith(
        'grades',
        'all-grades',
        expect.objectContaining({
          data: grades,
        })
      );

      // Should cache individual grades
      expect(mockSetItem).toHaveBeenCalledWith(
        'grades',
        '1',
        expect.objectContaining({
          data: grades[0],
        })
      );

      expect(mockSetItem).toHaveBeenCalledWith(
        'grades',
        '2',
        expect.objectContaining({
          data: grades[1],
        })
      );

      expect(mockSetItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('getCachedGrades', () => {
    it('should retrieve cached grades', async () => {
      const grades = [
        { id: '1', subject: 'Math', marks: 85 },
        { id: '2', subject: 'English', marks: 90 },
      ];
      const cachedData = {
        data: grades,
        metadata: {
          cachedAt: Date.now(),
          expiresAt: Date.now() + 10000,
          version: '1.0.0',
        },
      };

      vi.spyOn(indexedDB, 'getItem').mockResolvedValue(cachedData as any);

      const result = await getCachedGrades();

      expect(result).toEqual(grades);
    });
  });

  describe('cacheAttendance', () => {
    it('should cache all attendance and individual records', async () => {
      const mockSetItem = vi.spyOn(indexedDB, 'setItem').mockResolvedValue();
      const attendance = [
        { id: '1', date: '2024-01-15', status: 'present' },
        { id: '2', date: '2024-01-16', status: 'absent' },
      ];

      await cacheAttendance(attendance);

      // Should cache all attendance
      expect(mockSetItem).toHaveBeenCalledWith(
        'attendance',
        'all-attendance',
        expect.objectContaining({
          data: attendance,
        })
      );

      // Should cache individual records
      expect(mockSetItem).toHaveBeenCalledWith(
        'attendance',
        '1',
        expect.objectContaining({
          data: attendance[0],
        })
      );

      expect(mockSetItem).toHaveBeenCalledWith(
        'attendance',
        '2',
        expect.objectContaining({
          data: attendance[1],
        })
      );

      expect(mockSetItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('getCachedAttendance', () => {
    it('should retrieve cached attendance', async () => {
      const attendance = [
        { id: '1', date: '2024-01-15', status: 'present' },
        { id: '2', date: '2024-01-16', status: 'absent' },
      ];
      const cachedData = {
        data: attendance,
        metadata: {
          cachedAt: Date.now(),
          expiresAt: Date.now() + 10000,
          version: '1.0.0',
        },
      };

      vi.spyOn(indexedDB, 'getItem').mockResolvedValue(cachedData as any);

      const result = await getCachedAttendance();

      expect(result).toEqual(attendance);
    });
  });
});
