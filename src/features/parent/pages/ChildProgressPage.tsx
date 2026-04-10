import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PortalLayout } from '@/components/templates';
import { DataTable } from '@/components/organisms';
import { Card, Dropdown } from '@/components/molecules';
import { Button, Badge, Spinner } from '@/components/atoms';
import { parentService } from '@/services/api';
import { Grade } from '@/types/api.types';

export const ChildProgressPage = () => {
  const navigate = useNavigate();
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Mock children data - in real app, this would come from parent profile
  const children = [
    { id: 'child1', name: 'John Doe' },
    { id: 'child2', name: 'Jane Doe' },
  ];

  const { data: gradesData, isLoading: gradesLoading } = useQuery({
    queryKey: ['child-grades', selectedChildId, selectedYear, selectedSubject],
    queryFn: () =>
      parentService.getChildGrades(selectedChildId, {
        academicYear: selectedYear,
        subject: selectedSubject,
        limit: 100,
      }),
    enabled: !!selectedChildId,
  });

  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['child-performance', selectedChildId],
    queryFn: () => parentService.getChildPerformanceSummary(selectedChildId),
    enabled: !!selectedChildId,
  });

  const gradeColumns = [
    {
      key: 'subject' as const,
      label: 'Subject',
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'marksObtained' as const,
      label: 'Marks',
      render: (value: number, row: Grade) => (
        <span>
          {value} / {row.totalMarks}
        </span>
      ),
    },
    {
      key: 'percentage' as const,
      label: 'Percentage',
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}%</span>,
    },
    {
      key: 'grade' as const,
      label: 'Grade',
      render: (value: string) => <Badge variant="info">{value}</Badge>,
    },
    {
      key: 'remarks' as const,
      label: 'Remarks',
      render: (value?: string) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{value || '-'}</span>
      ),
    },
  ];

  return (
    <PortalLayout title="Child Progress">
      <div className="space-y-6">
        {/* Child Selection */}
        <Card>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Select Child</h2>

            <Dropdown
              options={children.map((child) => ({
                value: child.id,
                label: child.name,
              }))}
              value={selectedChildId}
              onChange={(value: string | number) => setSelectedChildId(String(value))}
              placeholder="Select a child"
            />
          </div>
        </Card>

        {selectedChildId && (
          <>
            {/* Performance Summary */}
            {performanceLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : performanceData ? (
              <Card>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Performance Summary
                  </h3>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-950">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Average Grade
                      </p>
                      <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {performanceData.averageGrade.toFixed(1)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-success-50 p-4 dark:bg-success-950">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">GPA</p>
                      <p className="mt-1 text-2xl font-bold text-success-600 dark:text-success-400">
                        {performanceData.gpa.toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-950">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Trend</p>
                      <p className="mt-1 text-sm font-semibold text-secondary-600 dark:text-secondary-400">
                        {performanceData.performanceTrends.length > 0
                          ? `${performanceData.performanceTrends[performanceData.performanceTrends.length - 1].month}`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}

            {/* Filters */}
            <Card>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Filters</h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Dropdown
                    options={[
                      { value: '2024', label: '2024' },
                      { value: '2023', label: '2023' },
                    ]}
                    value={selectedYear}
                    onChange={(value: string | number) => setSelectedYear(String(value))}
                    placeholder="All years"
                  />

                  <Dropdown
                    options={[
                      { value: 'Mathematics', label: 'Mathematics' },
                      { value: 'English', label: 'English' },
                      { value: 'Science', label: 'Science' },
                      { value: 'History', label: 'History' },
                    ]}
                    value={selectedSubject}
                    onChange={(value: string | number) => setSelectedSubject(String(value))}
                    placeholder="All subjects"
                  />
                </div>
              </div>
            </Card>

            {/* Grades Table */}
            {gradesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : gradesData?.data && gradesData.data.length > 0 ? (
              <Card>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Grades ({gradesData.data.length})
                  </h3>

                  <DataTable columns={gradeColumns} data={gradesData.data} pageSize={10} />
                </div>
              </Card>
            ) : (
              <Card className="text-center">
                <p className="text-neutral-600 dark:text-neutral-400">No grades found</p>
              </Card>
            )}

            {/* Quick Links */}
            <Card>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Quick Links
                </h3>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/parent/attendance?childId=${selectedChildId}`)}
                  >
                    View Attendance
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/parent/exams?childId=${selectedChildId}`)}
                  >
                    View Exams
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/parent/fees?childId=${selectedChildId}`)}
                  >
                    View Fees
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </PortalLayout>
  );
};

export default ChildProgressPage;
