import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PortalLayout } from '@/components/templates';
import { Card, Dropdown, NotificationToast } from '@/components/molecules';
import { Button, Spinner } from '@/components/atoms';
import { teacherService } from '@/services/api';
import { Exam, SubmitGradesRequest } from '@/types/api.types';

const gradeSchema = z.object({
  examId: z.string().min(1, 'Please select an exam'),
  grades: z.array(
    z.object({
      studentId: z.string(),
      marksObtained: z.number().min(0, 'Marks cannot be negative'),
      remarks: z.string().optional(),
    })
  ),
});

type GradeFormData = z.infer<typeof gradeSchema>;

export const GradeManagementPage = () => {
  const [searchParams] = useSearchParams();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [selectedExamId, setSelectedExamId] = useState(searchParams.get('classId') || '');
  const [showStats, setShowStats] = useState(false);

  const { data: examsData, isLoading: examsLoading } = useQuery({
    queryKey: ['teacher-exams-grading'],
    queryFn: () => teacherService.getExamsForGrading({ limit: 100 }),
  });

  const { data: examDetailsData, isLoading: examDetailsLoading } = useQuery({
    queryKey: ['exam-grading-details', selectedExamId],
    queryFn: () => teacherService.getExamForGrading(selectedExamId),
    enabled: !!selectedExamId,
  });

  const { data: statsData } = useQuery({
    queryKey: ['exam-grade-stats', selectedExamId],
    queryFn: () => teacherService.getGradeStatistics(selectedExamId),
    enabled: !!selectedExamId && showStats,
  });

  const submitGradesMutation = useMutation({
    mutationFn: (data: SubmitGradesRequest) => teacherService.submitGrades(data),
    onSuccess: () => {
      setNotification({
        type: 'success',
        message: 'Grades submitted successfully!',
      });
      form.reset();
      setTimeout(() => setNotification(null), 3000);
    },
    onError: () => {
      setNotification({
        type: 'error',
        message: 'Failed to submit grades. Please try again.',
      });
    },
  });

  const form = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      examId: selectedExamId,
      grades: [],
    },
  });

  const selectedExam = useMemo(
    () => examsData?.data.find((exam) => exam.id === selectedExamId),
    [examsData?.data, selectedExamId]
  );

  const handleExamChange = (examId: string | number) => {
    const id = String(examId);
    setSelectedExamId(id);
    form.setValue('examId', id);
    setShowStats(false);
  };

  const handleMarksChange = (studentId: string, marks: number) => {
    const currentGrades = form.getValues('grades');
    const existingIndex = currentGrades.findIndex((g) => g.studentId === studentId);

    if (existingIndex >= 0) {
      currentGrades[existingIndex].marksObtained = marks;
    } else {
      currentGrades.push({
        studentId,
        marksObtained: marks,
        remarks: '',
      });
    }

    form.setValue('grades', currentGrades);
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    const currentGrades = form.getValues('grades');
    const existingIndex = currentGrades.findIndex((g) => g.studentId === studentId);

    if (existingIndex >= 0) {
      currentGrades[existingIndex].remarks = remarks;
    }

    form.setValue('grades', currentGrades);
  };

  const onSubmit = (data: GradeFormData) => {
    if (data.grades.length === 0) {
      setNotification({
        type: 'error',
        message: 'Please enter grades for at least one student',
      });
      return;
    }

    submitGradesMutation.mutate({
      examId: data.examId,
      grades: data.grades,
    });
  };

  if (examsLoading) {
    return (
      <PortalLayout title="Grade Management">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Grade Management">
      <div className="space-y-6">
        {notification && (
          <NotificationToast
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        <Card>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Select Exam
            </h2>

            <Dropdown
              options={
                examsData?.data.map((exam) => ({
                  value: exam.id,
                  label: `${exam.name} - ${exam.subject}`,
                })) || []
              }
              value={selectedExamId}
              onChange={handleExamChange}
              placeholder="Select an exam"
            />

            {selectedExam && (
              <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-950">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {selectedExam.name} - {selectedExam.subject}
                </p>
                <p className="mt-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Total Marks: {selectedExam.totalMarks}
                </p>
              </div>
            )}
          </div>
        </Card>

        {selectedExamId && (
          <>
            <Card>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {examDetailsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner />
                  </div>
                ) : examDetailsData?.students && examDetailsData.students.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      Enter Grades
                    </h3>
                    {examDetailsData.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {student.name}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {student.enrollmentNumber}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                              Marks
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={selectedExam?.totalMarks}
                              placeholder="0"
                              onChange={(e) =>
                                handleMarksChange(student.id, parseFloat(e.target.value) || 0)
                              }
                              className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                            />
                          </div>

                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                              Remarks
                            </label>
                            <input
                              type="text"
                              placeholder="Optional"
                              onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                              className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-neutral-600 dark:text-neutral-400">
                    No students found
                  </p>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitGradesMutation.isPending}
                  >
                    Submit Grades
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowStats(!showStats)}
                  >
                    {showStats ? 'Hide' : 'Show'} Statistics
                  </Button>
                </div>
              </form>
            </Card>

            {showStats && statsData && (
              <Card>
                <div className="space-y-4">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    Grade Statistics
                  </h3>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-950">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Class Average
                      </p>
                      <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {statsData.classAverage.toFixed(1)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-success-50 p-4 dark:bg-success-950">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Highest Score
                      </p>
                      <p className="mt-1 text-2xl font-bold text-success-600 dark:text-success-400">
                        {statsData.highestScore}
                      </p>
                    </div>

                    <div className="rounded-lg bg-danger-50 p-4 dark:bg-danger-950">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Lowest Score
                      </p>
                      <p className="mt-1 text-2xl font-bold text-danger-600 dark:text-danger-400">
                        {statsData.lowestScore}
                      </p>
                    </div>

                    <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-950">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Grade Distribution
                      </p>
                      <p className="mt-1 text-sm font-semibold text-secondary-600 dark:text-secondary-400">
                        {Object.keys(statsData.gradeDistribution).length} grades
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </PortalLayout>
  );
};

export default GradeManagementPage;
