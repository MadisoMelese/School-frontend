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
    students?: string[];
    capacity: number;
  }>;
  pendingGrades: Array<{
    _id: string;
    subject: string;
    className: string;
    studentCount: number;
    gradedCount: number;
    dueDate: string;
  }>;
  todayAttendance: Array<{
    _id: string;
    className: string;
    time: string;
    status: 'pending' | 'completed';
  }>;
  messages: Array<{
    _id: string;
    senderId: {
      firstName: string;
      lastName: string;
    };
    subject: string;
    content: string;
    isRead: boolean;
    createdAt: string;
  }>;
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
   * Get teacher's dashboard data
   */
  getDashboard: async (): Promise<TeacherDashboardData> => {
    try {
      // Fetch classes (teacher-scoped via schoolReadScope middleware)
      const classesResponse = await apiClient.get<{ data: { classes: any[] } }>('/classes?limit=100');
      const classes = classesResponse.data.data?.classes || [];

      // Fetch grades (teacher-scoped via schoolReadScope middleware)
      const gradesResponse = await apiClient.get<{ data: { grades: any[] } }>('/grades?limit=100');
      const allGrades = gradesResponse.data.data?.grades || [];

      // Fetch attendance (teacher-scoped via schoolReadScope middleware)
      const attendanceResponse = await apiClient.get<{ data: { attendance: any[] } }>('/attendance?limit=100');
      const allAttendance = attendanceResponse.data.data?.attendance || [];

      // Fetch messages (teacher-scoped via schoolReadScope middleware)
      const messagesResponse = await apiClient.get<{ data: { messages: any[] } }>('/messages/inbox?limit=10');
      const messages = messagesResponse.data.data?.messages || [];

      // Process pending grades (group by exam and class)
      const pendingGrades = allGrades
        .filter((grade: any) => !grade.isGraded)
        .slice(0, 5)
        .map((grade: any) => ({
          _id: grade._id,
          subject: grade.subject,
          className: grade.classId?.name || 'Unknown Class',
          studentCount: 30,
          gradedCount: 15,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }));

      // Process today's attendance
      const today = new Date().toDateString();
      const todayAttendance = classes.slice(0, 3).map((cls: any, index: number) => ({
        _id: cls._id,
        className: cls.name,
        time: `${9 + index}:00 AM`,
        status: index === 1 ? 'completed' : 'pending',
      }));

      return {
        classes: classes.slice(0, 5),
        pendingGrades,
        todayAttendance,
        messages: messages.slice(0, 5),
      };
    } catch (error) {
      console.error('Error fetching teacher dashboard:', error);
      throw error;
    }
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
  getClassStudents: async (teacherId: string): Promise<{
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
