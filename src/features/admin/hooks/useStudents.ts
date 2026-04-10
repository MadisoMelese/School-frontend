import { useState, useCallback } from 'react';
import {
  studentService,
  type Student,
  type StudentFilters,
  type CreateStudentRequest,
  type UpdateStudentRequest,
} from '@services/admin/studentService';

interface UseStudentsState {
  students: Student[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

export const useStudents = () => {
  const [state, setState] = useState<UseStudentsState>({
    students: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
  });

  /**
   * Fetch students with filters
   */
  const fetchStudents = useCallback(async (filters?: StudentFilters) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await studentService.getStudents(filters);
      setState((prev) => ({
        ...prev,
        students: data.students,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        loading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch students';
      setState((prev) => ({ ...prev, error: message, loading: false }));
    }
  }, []);

  /**
   * Get a single student
   */
  const getStudent = useCallback(async (studentId: string) => {
    try {
      return await studentService.getStudentById(studentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch student';
      throw new Error(message);
    }
  }, []);

  /**
   * Create a new student
   */
  const createStudent = useCallback(async (data: CreateStudentRequest) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const student = await studentService.createStudent(data);
      setState((prev) => ({
        ...prev,
        students: [student, ...prev.students],
        total: prev.total + 1,
        loading: false,
      }));
      return student;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create student';
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw new Error(message);
    }
  }, []);

  /**
   * Update a student
   */
  const updateStudent = useCallback(async (studentId: string, data: UpdateStudentRequest) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const student = await studentService.updateStudent(studentId, data);
      setState((prev) => ({
        ...prev,
        students: prev.students.map((s) => (s._id === studentId ? student : s)),
        loading: false,
      }));
      return student;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update student';
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw new Error(message);
    }
  }, []);

  /**
   * Delete a student
   */
  const deleteStudentFn = useCallback(async (studentId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await studentService.deleteStudent(studentId);
      setState((prev) => ({
        ...prev,
        students: prev.students.filter((s) => s._id !== studentId),
        total: prev.total - 1,
        loading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete student';
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw new Error(message);
    }
  }, []);

  return {
    ...state,
    fetchStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent: deleteStudentFn,
  };
};
