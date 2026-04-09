import { apiClient } from './client';
import {
  ChildData,
  Grade,
  Attendance,
  Exam,
  Fee,
  Message,
  SendMessageRequest,
  SendMessageResponse,
  PaginatedResponse,
} from '@/types/api.types';

/**
 * Parent Service
 * Handles parent-specific API calls for child data, progress tracking, communication
 */

export const parentService = {
  /**
   * Get child's data (overview)
   */
  getChildData: async (childId: string): Promise<ChildData> => {
    const response = await apiClient.get<ChildData>(`/parent/children/${childId}`);
    return response.data;
  },

  /**
   * Get child's grades
   */
  getChildGrades: async (
    childId: string,
    params?: {
      academicYear?: string;
      subject?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Grade>> => {
    const response = await apiClient.get<PaginatedResponse<Grade>>(
      `/parent/children/${childId}/grades`,
      { params }
    );
    return response.data;
  },

  /**
   * Get child's attendance
   */
  getChildAttendance: async (
    childId: string,
    params?: {
      month?: string;
      year?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Attendance>> => {
    const response = await apiClient.get<PaginatedResponse<Attendance>>(
      `/parent/children/${childId}/attendance`,
      { params }
    );
    return response.data;
  },

  /**
   * Get child's attendance percentage
   */
  getChildAttendancePercentage: async (
    childId: string
  ): Promise<{ percentage: number; term: string }> => {
    const response = await apiClient.get<{ percentage: number; term: string }>(
      `/parent/children/${childId}/attendance/percentage`
    );
    return response.data;
  },

  /**
   * Get child's exams
   */
  getChildExams: async (
    childId: string,
    params?: {
      status?: 'upcoming' | 'past';
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Exam>> => {
    const response = await apiClient.get<PaginatedResponse<Exam>>(
      `/parent/children/${childId}/exams`,
      { params }
    );
    return response.data;
  },

  /**
   * Get child's fees
   */
  getChildFees: async (
    childId: string,
    params?: {
      status?: string;
      academicYear?: string;
      term?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Fee>> => {
    const response = await apiClient.get<PaginatedResponse<Fee>>(
      `/parent/children/${childId}/fees`,
      { params }
    );
    return response.data;
  },

  /**
   * Get child's fee summary
   */
  getChildFeeSummary: async (
    childId: string
  ): Promise<{
    totalFees: number;
    totalPaid: number;
    outstandingBalance: number;
  }> => {
    const response = await apiClient.get<{
      totalFees: number;
      totalPaid: number;
      outstandingBalance: number;
    }>(`/parent/children/${childId}/fees/summary`);
    return response.data;
  },

  /**
   * Get child's performance summary
   */
  getChildPerformanceSummary: async (
    childId: string
  ): Promise<{
    averageGrade: number;
    gpa: number;
    performanceTrends: Array<{ month: string; average: number }>;
  }> => {
    const response = await apiClient.get<{
      averageGrade: number;
      gpa: number;
      performanceTrends: Array<{ month: string; average: number }>;
    }>(`/parent/children/${childId}/performance/summary`);
    return response.data;
  },

  /**
   * Get parent's messages
   */
  getMessages: async (params?: {
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Message>> => {
    const response = await apiClient.get<PaginatedResponse<Message>>('/parent/messages', {
      params,
    });
    return response.data;
  },

  /**
   * Send message to teacher or administrator
   */
  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await apiClient.post<SendMessageResponse>('/parent/messages', data);
    return response.data;
  },

  /**
   * Get unread message count
   */
  getUnreadMessageCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>('/parent/messages/unread/count');
    return response.data;
  },

  /**
   * Mark message as read
   */
  markMessageAsRead: async (messageId: string): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      `/parent/messages/${messageId}/read`,
      {}
    );
    return response.data;
  },
};

export default parentService;
