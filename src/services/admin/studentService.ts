import { apiClient } from '../api/client';

/**
 * Student Interface matching backend model
 */
export interface Student {
  _id: string;
  userId: {
    _id: string;
    email: string;
    firstname?: string;
    lastname?: string;
  };
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  phone?: string;
  address?: string;
  classId?: {
    _id: string;
    name: string;
    section: string;
    grade: string;
  };
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'suspended' | 'graduated';
  createdAt: string;
  updatedAt: string;
}

export interface StudentListResponse {
  students: Student[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateStudentRequest {
  userId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  phone?: string;
  address?: string;
  classId?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  enrollmentDate?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'graduated';
}

export interface UpdateStudentRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  phone?: string;
  address?: string;
  classId?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'graduated';
}

export interface StudentFilters {
  status?: string;
  classId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Admin Student Management Service
 * Handles all student management operations for admins
 */
export const studentService = {
  /**
   * Get all students with optional filtering
   */
  async getStudents(filters?: StudentFilters): Promise<StudentListResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.classId) params.append('classId', filters.classId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<{
      success: boolean;
      data: StudentListResponse;
      message: string;
    }>('/students', { params });
    return response.data.data;
  },

  /**
   * Get a single student by ID
   */
  async getStudentById(studentId: string): Promise<Student> {
    const response = await apiClient.get<{
      success: boolean;
      data: Student;
      message: string;
    }>(`/students/${studentId}`);
    return response.data.data;
  },

  /**
   * Create a new student
   */
  async createStudent(data: CreateStudentRequest): Promise<Student> {
    const response = await apiClient.post<{
      success: boolean;
      data: Student;
      message: string;
    }>('/students', data);
    return response.data.data;
  },

  /**
   * Update a student
   */
  async updateStudent(studentId: string, data: UpdateStudentRequest): Promise<Student> {
    const response = await apiClient.put<{
      success: boolean;
      data: Student;
      message: string;
    }>(`/students/${studentId}`, data);
    return response.data.data;
  },

  /**
   * Delete a student
   */
  async deleteStudent(studentId: string): Promise<void> {
    await apiClient.delete(`/students/${studentId}`);
  },
};
