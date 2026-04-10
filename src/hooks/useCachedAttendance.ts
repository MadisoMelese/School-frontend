import { useCachedQuery } from './useCachedQuery';
import { useAuth } from './useAuth';
import { studentService } from '@/services/api/studentService';
import { cacheAttendance } from '@/services/offline/cacheService';
import { Attendance, PaginatedResponse } from '@/types/api.types';

/**
 * useCachedAttendance Hook
 * Fetches and caches attendance data for offline access
 */

export interface UseCachedAttendanceOptions {
  month?: string;
  year?: string;
  page?: number;
  limit?: number;
}

export const useCachedAttendance = (options: UseCachedAttendanceOptions = {}) => {
  const { user } = useAuth();

  const fetchAttendance = async (): Promise<PaginatedResponse<Attendance>> => {
    const response = await studentService.getAttendance(options);

    // Cache attendance for offline access
    if (response.data && response.data.length > 0) {
      await cacheAttendance(response.data);
    }

    return response;
  };

  // Create cache key based on options
  const cacheKey = `attendance-${user?.id}-${JSON.stringify(options)}`;

  return useCachedQuery<PaginatedResponse<Attendance>>({
    storeName: 'attendance',
    cacheKey,
    queryFn: fetchAttendance,
    enabled: !!user?.id,
  });
};

export default useCachedAttendance;
