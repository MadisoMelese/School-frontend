import { useCachedQuery } from './useCachedQuery';
import { useAuth } from './useAuth';
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

  const fetchDashboardData = async (): Promise<DashboardData> => {
    // Fetch all dashboard data in parallel
    const [
      gradesResponse,
      attendanceResponse,
      examsResponse,
      feesResponse,
      messagesResponse,
      attendancePercentageResponse,
      feeSummaryResponse,
      unreadMessageCountResponse,
    ] = await Promise.all([
      studentService.getGrades({ limit: 5 }),
      studentService.getAttendance({ limit: 10 }),
      studentService.getExams({ status: 'upcoming', limit: 5 }),
      studentService.getFees({ limit: 5 }),
      studentService.getMessages({ isRead: false, limit: 5 }),
      studentService.getAttendancePercentage(),
      studentService.getFeeSummary(),
      studentService.getUnreadMessageCount(),
    ]);

    return {
      grades: gradesResponse.data,
      attendance: attendanceResponse.data,
      exams: examsResponse.data,
      fees: feesResponse.data,
      messages: messagesResponse.data,
      attendancePercentage: attendancePercentageResponse.percentage,
      feeSummary: feeSummaryResponse,
      unreadMessageCount: unreadMessageCountResponse.count,
    };
  };

  return useCachedQuery<DashboardData>({
    storeName: 'user',
    cacheKey: `dashboard-${user?.id}`,
    queryFn: fetchDashboardData,
    enabled: !!user?.id,
  });
};

export default useCachedDashboard;
