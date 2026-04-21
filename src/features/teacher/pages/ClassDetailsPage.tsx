import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Button } from '@components/atoms/Button';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { apiClient } from '@services/api/client';

/**
 * Teacher Class Details Page
 * View detailed information about a specific class including students
 * Mobile-first responsive design with dark theme support
 */

interface Student {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  gender: string;
  status: string;
}

interface ClassDetails {
  _id: string;
  name: string;
  section: string;
  grade: string;
  capacity: number;
  academicYear: string;
  status: string;
  students?: Student[];
}

export const ClassDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassDetails | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load class details
  useEffect(() => {
    const loadClassDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch class details
        const classResponse = await apiClient.get<{ data: ClassDetails }>(`/classes/${id}`);
        const classInfo = classResponse.data.data || classResponse.data;
        setClassData(classInfo);

        // Fetch students for this class
        const studentsResponse = await apiClient.get<{ data: { students: Student[] } }>(
          `/students?classId=${id}&limit=100`
        );
        const studentsData = studentsResponse.data.data?.students || [];
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load class details');
      } finally {
        setLoading(false);
      }
    };

    loadClassDetails();
  }, [id]);

  // Filter students
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.studentId.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <DashboardLayout title="Class Details" description="Loading...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !classData) {
    return (
      <DashboardLayout title="Class Details" description="Error loading class">
        <div className="bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-900 rounded-lg p-6">
          <p className="text-danger-700 dark:text-danger-200">{error || 'Class not found'}</p>
          <Button variant="secondary" onClick={() => navigate('/teacher/classes')} className="mt-4">
            Back to Classes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={classData.name}
      description={`Grade ${classData.grade} - Section ${classData.section}`}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Back Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/teacher/classes')}
          className="flex items-center gap-2"
        >
          <Icon name="ChevronLeft" size={16} />
          Back to Classes
        </Button>

        {/* Class Information Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 sm:p-6 border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Class Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Class Name</p>
              <p className="font-semibold text-neutral-900 dark:text-white">{classData.name}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Grade</p>
              <Badge variant="info">{classData.grade}</Badge>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Section</p>
              <Badge variant="neutral">{classData.section}</Badge>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Capacity</p>
              <p className="font-semibold text-neutral-900 dark:text-white">
                {students.length} / {classData.capacity}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Academic Year</p>
              <p className="font-semibold text-neutral-900 dark:text-white">
                {classData.academicYear}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Status</p>
              <Badge variant={classData.status === 'active' ? 'success' : 'warning'}>
                {classData.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(`/teacher/attendance/${id}`)}
            className="flex items-center justify-center gap-2"
          >
            <Icon name="CheckSquare" size={18} />
            Mark Attendance
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate(`/teacher/grades?classId=${id}`)}
            className="flex items-center justify-center gap-2"
          >
            <Icon name="FileText" size={18} />
            View Grades
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate(`/teacher/exams?classId=${id}`)}
            className="flex items-center justify-center gap-2"
          >
            <Icon name="BookOpen" size={18} />
            View Exams
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate(`/teacher/timetable?classId=${id}`)}
            className="flex items-center justify-center gap-2"
          >
            <Icon name="Calendar" size={18} />
            View Timetable
          </Button>
        </div>

        {/* Students List */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Students ({students.length})
              </h2>
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Icon name="Users" size={48} className="text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">
                {searchTerm ? 'No students match your search' : 'No students in this class'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Student ID
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Gender
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">
                        {student.studentId}
                      </td>
                      <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                        {student.email || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300 capitalize">
                        {student.gender}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={student.status === 'active' ? 'success' : 'warning'}
                          className="text-xs"
                        >
                          {student.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassDetailsPage;
