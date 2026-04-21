import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { teacherService } from '@services/api/teacherService';

/**
 * Teacher Grade Management Page
 * View and manage student grades
 * Mobile-first responsive design with dark theme support
 */

interface Grade {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    studentId: string;
  };
  classId: {
    _id: string;
    name: string;
    grade: string;
  };
  subject: string;
  examType: string;
  score: number;
  maxScore: number;
  grade: string;
  remarks?: string;
  createdAt: string;
}

export const GradeManagementPage: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Load grades
  useEffect(() => {
    const loadGrades = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await teacherService.getPendingGrades({ page, limit });
        const gradesData = response.data?.grades || response.grades || [];
        setGrades(Array.isArray(gradesData) ? gradesData : []);
        setTotalPages(response.data?.totalPages || response.totalPages || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load grades');
      } finally {
        setLoading(false);
      }
    };

    loadGrades();
  }, [page, limit]);

  // Filter grades
  const filteredGrades = grades.filter((grade) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      grade.studentId?.firstName?.toLowerCase().includes(searchLower) ||
      grade.studentId?.lastName?.toLowerCase().includes(searchLower) ||
      grade.studentId?.studentId?.toLowerCase().includes(searchLower) ||
      grade.subject?.toLowerCase().includes(searchLower);

    const matchesSubject = !filterSubject || grade.subject === filterSubject;

    return matchesSearch && matchesSubject;
  });

  // Get unique subjects
  const subjects = Array.from(new Set(grades.map((g) => g.subject).filter(Boolean)));

  return (
    <DashboardLayout title="Grade Management" description="View and manage student grades">
      <div className="space-y-4 sm:space-y-6">
        {/* Messages */}
        {error && (
          <div className="bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-900 rounded-lg p-4">
            <p className="text-danger-700 dark:text-danger-200">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-success-50 dark:bg-success-950 border border-success-200 dark:border-success-900 rounded-lg p-4">
            <p className="text-success-700 dark:text-success-200">{success}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden border border-neutral-200 dark:border-neutral-700">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading grades...</p>
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className="p-12 text-center">
              <Icon name="FileText" size={48} className="text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">
                {searchTerm || filterSubject ? 'No grades match your filters' : 'No grades found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Class
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Exam Type
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.map((grade) => (
                    <tr
                      key={grade._id}
                      className="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {grade.studentId?.firstName} {grade.studentId?.lastName}
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            {grade.studentId?.studentId}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                        {grade.classId?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                        {grade.subject}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="info" className="text-xs">
                          {grade.examType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {grade.score}/{grade.maxScore}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            grade.grade === 'A' || grade.grade === 'B'
                              ? 'success'
                              : grade.grade === 'C'
                              ? 'warning'
                              : 'danger'
                          }
                          className="text-xs"
                        >
                          {grade.grade}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                        {new Date(grade.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Summary */}
        {!loading && filteredGrades.length > 0 && (
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Showing {filteredGrades.length} grades
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GradeManagementPage;
