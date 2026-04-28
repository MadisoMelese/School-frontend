import { apiClient } from './client';
import { PaginatedResponse } from '@/types/api.types';

/**
 * Teacher Service
 * Handles teacher-specific API calls
 */

export interface TeacherDashboardData {
  classes: Array<{
    _id: string;
    name: string;
    section: string;
    grade: string;
    studentCount: number;
    capacity: number;
    academicYear: string;
    status: string;
  }>;
  totalClasses: number;
  totalStudents: number;
  recentGrades: any[];
  attendanceStats: {
    total: number;
    present: number;
    absent: number;
    late: number;
  };
  pendingGradesCount: number;
  unreadMessagesCount: number;
  recentMessages: any[];
}

export const teacherService = {
  /**
   * Get teacher's assigned classes
   */
  getClasses: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>('/classes', {
      params,
    });
    return response.data;
  },

  /**
   * Get teacher's dashboard data (aggregated endpoint)
   * Single API call instead of 4 separate calls
   */
  getDashboard: async (): Promise<TeacherDashboardData> => {
    const response = await apiClient.get<{ data: TeacherDashboardData }>('/teachers/me/dashboard');
    return response.data.data;
  },

  /**
   * Get teacher's pending grading tasks
   */
  getPendingGrades: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>('/grades', {
      params,
    });
    return response.data;
  },

  /**
   * Get teacher's messages
   */
  getMessages: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>('/messages/inbox', {
      params,
    });
    return response.data;
  },

  /**
   * Get attendance records
   */
  getAttendance: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>('/attendance', {
      params,
    });
    return response.data;
  },

  /**
   * Get class and students for a teacher
   */
  getClassStudents: async (teacherId: string = 'me'): Promise<{
    class: {
      _id: string;
      name: string;
      section: string;
      grade: string;
      capacity: number;
      academicYear: string;
      status: string;
    } | null;
    students: Array<{
      _id: string;
      studentId: string;
      firstName: string;
      lastName: string;
      email?: string;
      gender: string;
      status: string;
    }>;
  }> => {
    const response = await apiClient.get<{
      data: {
        class: any;
        students: any[];
      };
    }>(`/teachers/${teacherId}/class-students`);
    return response.data.data;
  },

  /**
   * Get today's classes for a teacher
   */
  getTodaysClasses: async (): Promise<any[]> => {
    const response = await apiClient.get<{ data: { classes: any[] } }>('/classes?limit=100');
    return response.data.data?.classes || [];
  },

  /**
   * Get exams for grading
   */
  getExamsForGrading: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>('/exams', {
      params,
    });
    return response.data;
  },

  /**
   * Get exam details for grading
   */
  getExamForGrading: async (examId: string): Promise<any> => {
    const response = await apiClient.get<{ data: any }>(`/exams/${examId}`);
    return response.data.data;
  },

  /**
   * Get grade statistics
   */
  getGradeStatistics: async (examId: string): Promise<any> => {
    const response = await apiClient.get<{ data: any }>(`/exams/${examId}/statistics`);
    return response.data.data;
  },

  /**
   * Submit grades
   */
  submitGrades: async (data: any): Promise<any> => {
    const response = await apiClient.post<{ data: any }>('/grades', data);
    return response.data.data;
  },

  /**
   * Mark attendance
   */
  markAttendance: async (data: any): Promise<any> => {
    const response = await apiClient.post<{ data: any }>('/attendance', data);
    return response.data.data;
  },

  /**
   * Send message
   */
  sendMessage: async (data: any): Promise<any> => {
    const response = await apiClient.post<{ data: any }>('/messages', data);
    return response.data.data;
  },
};

export default teacherService;
