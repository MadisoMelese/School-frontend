import { apiClient } from './client';
import {
  Grade,
  Attendance,
  Exam,
  Fee,
  Message,
  SendMessageRequest,
  SendMessageResponse,
  Timetable,
  PaginatedResponse,
} from '@/types/api.types';
import type { DashboardData } from '@/hooks/useCachedDashboard';

/**
 * Student Service
 * Handles student-specific API calls for grades, attendance, exams, fees, messages, timetable
 */

export const studentService = {
  /**
   * Get student's grades
   */
  getGrades: async (params?: {
    academicYear?: string;
    subject?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Grade>> => {
    const response = await apiClient.get<PaginatedResponse<Grade>>('/grades', {
      params,
    });
    return response.data;
  },

  /**
   * Get student's attendance records
   */
  getAttendance: async (params?: {
    month?: string;
    year?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Attendance>> => {
    const response = await apiClient.get<PaginatedResponse<Attendance>>('/attendance', {
      params,
    });
    return response.data;
  },

  /**
   * Get attendance percentage
   */
  getAttendancePercentage: async (): Promise<{ percentage: number; term: string }> => {
    const response = await apiClient.get<{ percentage: number; term: string }>(
      '/student/attendance/percentage'
    );
    return response.data;
  },

  /**
   * Get student's exams (upcoming and past)
   */
  getExams: async (params?: {
    status?: 'upcoming' | 'past';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Exam>> => {
    const response = await apiClient.get<PaginatedResponse<Exam>>('/exams', {
      params,
    });
    return response.data;
  },

  /**
   * Get exam details
   */
  getExamDetails: async (examId: string): Promise<Exam> => {
    const response = await apiClient.get<Exam>(`/exams/${examId}`);
    return response.data;
  },

  /**
   * Get student's fees
   */
  getFees: async (params?: {
    status?: string;
    academicYear?: string;
    term?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Fee>> => {
    const response = await apiClient.get<PaginatedResponse<Fee>>('/fees', {
      params,
    });
    return response.data;
  },

  /**
   * Get fee summary
   */
  getFeeSummary: async (): Promise<{
    totalFees: number;
    totalPaid: number;
    outstandingBalance: number;
  }> => {
    // Get all fees and calculate summary
    const feesResponse = await apiClient.get<PaginatedResponse<Fee>>('/fees');
    const fees = feesResponse.data.fees || [];
    
    const totalFees = fees.reduce((sum, fee: any) => sum + (fee.amount || 0), 0);
    const totalPaid = fees.reduce((sum, fee: any) => sum + (fee.paidAmount || 0), 0);
    const outstandingBalance = totalFees - totalPaid;
    
    return {
      totalFees,
      totalPaid,
      outstandingBalance,
    };
  },

  /**
   * Get student's messages
   */
  getMessages: async (params?: {
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Message>> => {
    const response = await apiClient.get<PaginatedResponse<Message>>('/messages/inbox', {
      params,
    });
    return response.data;
  },

  /**
   * Get message details
   */
  getMessageDetails: async (messageId: string): Promise<Message> => {
    const response = await apiClient.get<Message>(`/messages/${messageId}`);
    return response.data;
  },

  /**
   * Mark message as read
   */
  markMessageAsRead: async (messageId: string): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(
      `/messages/${messageId}/read`,
      {}
    );
    return response.data;
  },

  /**
   * Send message
   */
  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await apiClient.post<SendMessageResponse>('/messages', data);
    return response.data;
  },

  /**
   * Get unread message count
   */
  getUnreadMessageCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>('/messages/unread-count');
    return response.data;
  },

  /**
   * Get student's timetable
   */
  getTimetable: async (params?: { week?: string }): Promise<Timetable[]> => {
    const response = await apiClient.get<{ timetables: Timetable[]; total: number; page: number; totalPages: number }>('/timetables', {
      params,
    });
    return response.data.timetables || [];
  },

  /**
   * Get dashboard data (aggregated)
   */
  getDashboard: async (): Promise<DashboardData> => {
    const response = await apiClient.get<DashboardData>('/students/dashboard');
    return response.data;
  },

  /**
   * Get performance summary
   */
  getPerformanceSummary: async (): Promise<{
    averageGrade: number;
    highestScore: number;
    lowestScore: number;
    gpa: number;
  }> => {
    const response = await apiClient.get<{
      averageGrade: number;
      highestScore: number;
      lowestScore: number;
      gpa: number;
    }>('/student/performance/summary');
    return response.data;
  },

  /**
   * Initiate fee payment
   */
  initiateFeePayment: async (feeId: string): Promise<{ message: string; paymentUrl?: string }> => {
    const response = await apiClient.post<{ message: string; paymentUrl?: string }>(
      `/student/fees/${feeId}/payment`,
      {}
    );
    return response.data;
  },
};

export default studentService;
