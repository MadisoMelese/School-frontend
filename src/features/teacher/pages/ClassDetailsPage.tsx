import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PortalLayout } from '@/components/templates';
import { DataTable } from '@/components/organisms';
import { Card, SearchBar } from '@/components/molecules';
import { Button, Badge, Spinner } from '@/components/atoms';
import { teacherService } from '@/services/api';
import { ClassStudent } from '@/types/api.types';
import { useDebounce } from '@/hooks';
import { ChevronLeft } from 'lucide-react';

export const ClassDetailsPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  if (!classId) {
    return (
      <PortalLayout title="Class Details">
        <Card className="border-danger-200 bg-danger-50 dark:border-danger-900 dark:bg-danger-950">
          <p className="text-danger-700 dark:text-danger-200">Invalid class ID</p>
        </Card>
      </PortalLayout>
    );
  }

  const { data: classData, isLoading: classLoading } = useQuery({
    queryKey: ['teacher-class', classId],
    queryFn: () => teacherService.getClassDetails(classId),
  });

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['teacher-class-students', classId],
    queryFn: () => teacherService.getClassStudents(classId, { limit: 100 }),
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['teacher-class-stats', classId],
    queryFn: () => teacherService.getClassStatistics(classId),
  });

  const filteredStudents = useMemo(() => {
    if (!studentsData?.data) return [];
    return studentsData.data.filter(
      (student) =>
        student.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        student.enrollmentNumber.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [studentsData?.data, debouncedSearch]);

  const isLoading = classLoading || studentsLoading || statsLoading;

  if (isLoading) {
    return (
      <PortalLayout title="Class Details">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </PortalLayout>
    );
  }

  if (!classData) {
    return (
      <PortalLayout title="Class Details">
        <Card className="border-danger-200 bg-danger-50 dark:border-danger-900 dark:bg-danger-950">
          <p className="text-danger-700 dark:text-danger-200">Class not found</p>
        </Card>
      </PortalLayout>
    );
  }

  const studentColumns = [
    {
      key: 'name' as const,
      label: 'Student Name',
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'enrollmentNumber' as const,
      label: 'Enrollment Number',
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'success' : 'warning'}>{value}</Badge>
      ),
    },
  ];

  return (
    <PortalLayout title="Class Details">
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/teacher/classes')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          <ChevronLeft size={20} />
          Back to Classes
        </button>

        {/* Class Header */}
        <Card>
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {classData.name}
              </h2>
              <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                Grade {classData.gradeLevel} - Section {classData.section}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-950">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Students</p>
                <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {classData.studentCount}
                </p>
              </div>

              {statsData && (
                <>
                  <div className="rounded-lg bg-success-50 p-4 dark:bg-success-950">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Average Grade
                    </p>
                    <p className="mt-1 text-2xl font-bold text-success-600 dark:text-success-400">
                      {statsData.averageGrade.toFixed(1)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-warning-50 p-4 dark:bg-warning-950">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Attendance Rate
                    </p>
                    <p className="mt-1 text-2xl font-bold text-warning-600 dark:text-warning-400">
                      {(statsData.attendanceRate * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-950">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Performance Trend
                    </p>
                    <p className="mt-1 text-sm font-semibold text-secondary-600 dark:text-secondary-400">
                      {statsData.performanceTrends.length > 0
                        ? `${statsData.performanceTrends[statsData.performanceTrends.length - 1].month}`
                        : 'N/A'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2 pt-4 md:flex-row">
              <Button
                onClick={() => navigate(`/teacher/attendance?classId=${classId}`)}
                variant="primary"
              >
                Mark Attendance
              </Button>
              <Button
                onClick={() => navigate(`/teacher/grades?classId=${classId}`)}
                variant="secondary"
              >
                Enter Grades
              </Button>
            </div>
          </div>
        </Card>

        {/* Students List */}
        <Card>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Students ({filteredStudents.length})
              </h3>
            </div>

            <SearchBar
              placeholder="Search students by name or enrollment number..."
              value={searchTerm}
              onChange={setSearchTerm}
            />

            {filteredStudents.length === 0 ? (
              <p className="text-center text-neutral-600 dark:text-neutral-400">
                No students found
              </p>
            ) : (
              <DataTable
                columns={studentColumns}
                data={filteredStudents}
                pageSize={10}
              />
            )}
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default ClassDetailsPage;
