import { useCachedQuery } from './useCachedQuery';
import { useAuth } from './useAuth';
import { useCallback } from 'react';
import { studentService } from '@/services/api/studentService';

/**
 * useCachedDashboard Hook
 * Fetches and caches dashboard data for offline access
 */

export interface DashboardData {
  grades: any[];
  attendance: any[];
  exams: any[];
  fees: any[];
  messages: any[];
  attendancePercentage: number;
  feeSummary: {
    totalFees: number;
    totalPaid: number;
    outstandingBalance: number;
  };
  unreadMessageCount: number;
}

export const useCachedDashboard = () => {
  const { user } = useAuth();

  const fetchDashboardData = useCallback(async (): Promise<DashboardData> => {
    // Fetch dashboard data from single aggregated endpoint
    const response = await studentService.getDashboard();
    return response;
  }, []);

  return useCachedQuery<DashboardData>({
    storeName: 'user',
    cacheKey: `dashboard-${user?.id}`,
    queryFn: fetchDashboardData,
    enabled: !!user?.id,
  });
};

export default useCachedDashboard;
