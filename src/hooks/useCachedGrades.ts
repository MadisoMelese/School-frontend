import { useCachedQuery } from './useCachedQuery';
import { useAuth } from './useAuth';
import { useCallback, useMemo } from 'react';
import { studentService } from '@/services/api/studentService';
import { cacheGrades } from '@/services/offline/cacheService';
import { Grade, PaginatedResponse } from '@/types/api.types';

/**
 * useCachedGrades Hook
 * Fetches and caches grades data for offline access
 */

export interface UseCachedGradesOptions {
  academicYear?: string;
  subject?: string;
  page?: number;
  limit?: number;
}

export const useCachedGrades = (options: UseCachedGradesOptions = {}) => {
  const { user } = useAuth();

  const fetchGrades = useCallback(async (): Promise<PaginatedResponse<Grade>> => {
    const response = await studentService.getGrades(options);

    // Cache grades for offline access
    if (response.grades && Array.isArray(response.grades) && response.grades.length > 0) {
      await cacheGrades(response.grades);
    }

    return response;
  }, [options.academicYear, options.subject, options.page, options.limit]);

  // Create cache key based on options
  const cacheKey = useMemo(
    () => `grades-${user?.id}-${JSON.stringify(options)}`,
    [user?.id, options.academicYear, options.subject, options.page, options.limit]
  );

  return useCachedQuery<PaginatedResponse<Grade>>({
    storeName: 'grades',
    cacheKey,
    queryFn: fetchGrades,
    enabled: !!user?.id,
  });
};

export default useCachedGrades;
