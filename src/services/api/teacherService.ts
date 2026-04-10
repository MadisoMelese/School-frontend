import { apiClient } from './client';
import {
  Class,
  ClassStudent,
  Attendance,
  MarkAttendanceRequest,
  MarkAttendanceResponse,
  Exam,
  SubmitGradesRequest,
  SubmitGradesResponse,
  Message,
  SendMessageRequest,
  SendMessageResponse,
  PaginatedResponse,
} from '@/types/api.types';

/**
 * Teacher Service
 * Handles teacher-specific API calls for classes, attendance, grading, messages
 */

export const teacherService = {
  /**
   * Get teacher's assigned classes
   */
  getClasses: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Class>> => {
    const response = await apiClient.get<PaginatedResponse<Class>>('/teacher/classes', {
      params,
    });
    return response.data;
  },

  /**
   * Get class details
   */
  getClassDetails: async (classId: string): Promise<Class> => {
    const response = await apiClient.get<Class>(`/teacher/classes/${classId}`);
    return response.data;
  },

  /**
   * Get students in a class
   */
  getClassStudents: async (
    classId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<ClassStudent>> => {
    const response = await apiClient.get<PaginatedResponse<ClassStudent>>(
      `/teacher/classes/${classId}/students`,
      { params }
    );
    return response.data;
  },

  /**
   * Get class statistics
   */
  getClassStatistics: async (
    classId: string
  ): Promise<{
    averageGrade: number;
    attendanceRate: number;
    performanceTrends: Array<{ month: string; average: number }>;
  }> => {
    const response = await apiClient.get<{
      averageGrade: number;
      attendanceRate: number;
      performanceTrends: Array<{ month: string; average: number }>;
    }>(`/teacher/classes/${classId}/statistics`);
    return response.data;
  },

  /**
   * Get today's classes for attendance marking
   */
  getTodaysClasses: async (): Promise<Class[]> => {
    const response = await apiClient.get<Class[]>('/teacher/attendance/today');
    return response.data;
  },

  /**
   * Mark attendance for a class
   */
  markAttendance: async (data: MarkAttendanceRequest): Promise<MarkAttendanceResponse> => {
    const response = await apiClient.post<MarkAttendanceResponse>('/teacher/attendance', data);
    return response.data;
  },

  /**
   * Get attendance history
   */
  getAttendanceHistory: async (params?: {
    classId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Attendance>> => {
    const response = await apiClient.get<PaginatedResponse<Attendance>>(
      '/teacher/attendance/history',
      { params }
    );
    return response.data;
  },

  /**
   * Update attendance record
   */
  updateAttendance: async (
    attendanceId: string,
    data: {
      status: 'present' | 'absent' | 'late' | 'excused';
      notes?: string;
    }
  ): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      `/teacher/attendance/${attendanceId}`,
      data
    );
    return response.data;
  },

  /**
   * Get exams assigned to teacher for grading
   */
  getExamsForGrading: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Exam>> => {
    const response = await apiClient.get<PaginatedResponse<Exam>>('/teacher/exams/grading', {
      params,
    });
    return response.data;
  },

  /**
   * Get exam details with students for grading
   */
  getExamForGrading: async (
    examId: string
  ): Promise<{
    exam: Exam;
    students: Array<{
      id: string;
      name: string;
      enrollmentNumber: string;
    }>;
  }> => {
    const response = await apiClient.get<{
      exam: Exam;
      students: Array<{
        id: string;
        name: string;
        enrollmentNumber: string;
      }>;
    }>(`/teacher/exams/${examId}/grading`);
    return response.data;
  },

  /**
   * Submit grades for an exam
   */
  submitGrades: async (data: SubmitGradesRequest): Promise<SubmitGradesResponse> => {
    const response = await apiClient.post<SubmitGradesResponse>('/teacher/grades', data);
    return response.data;
  },

  /**
   * Get grade statistics for an exam
   */
  getGradeStatistics: async (
    examId: string
  ): Promise<{
    classAverage: number;
    highestScore: number;
    lowestScore: number;
    gradeDistribution: Record<string, number>;
  }> => {
    const response = await apiClient.get<{
      classAverage: number;
      highestScore: number;
      lowestScore: number;
      gradeDistribution: Record<string, number>;
    }>(`/teacher/exams/${examId}/statistics`);
    return response.data;
  },

  /**
   * Get teacher's messages
   */
  getMessages: async (params?: {
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Message>> => {
    const response = await apiClient.get<PaginatedResponse<Message>>('/teacher/messages', {
      params,
    });
    return response.data;
  },

  /**
   * Send message to student(s) or class
   */
  sendMessage: async (
    data: SendMessageRequest & { classId?: string }
  ): Promise<SendMessageResponse> => {
    const response = await apiClient.post<SendMessageResponse>('/teacher/messages', data);
    return response.data;
  },

  /**
   * Get unread message count
   */
  getUnreadMessageCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>('/teacher/messages/unread/count');
    return response.data;
  },

  /**
   * Get pending grading tasks count
   */
  getPendingGradingCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>('/teacher/grades/pending/count');
    return response.data;
  },
};

export default teacherService;
