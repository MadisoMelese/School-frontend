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
import { MarkAttendanceRequest } from '@/types/api.types';

const attendanceSchema = z.object({
  classId: z.string().min(1, 'Please select a class'),
  date: z.string().min(1, 'Please select a date'),
  attendance: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(['present', 'absent', 'late', 'excused']),
      notes: z.string().optional(),
    })
  ),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

export const AttendanceMarkingPage = () => {
  const [searchParams] = useSearchParams();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const classIdParam = searchParams.get('classId');

  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['teacher-classes-attendance'],
    queryFn: () => teacherService.getTodaysClasses(),
  });

  const [selectedClassId, setSelectedClassId] = useState(classIdParam || '');

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['class-students-attendance', selectedClassId],
    queryFn: () => teacherService.getClassStudents(selectedClassId, { limit: 100 }),
    enabled: !!selectedClassId,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: (data: MarkAttendanceRequest) => teacherService.markAttendance(data),
    onSuccess: () => {
      setNotification({
        type: 'success',
        message: 'Attendance marked successfully!',
      });
      form.reset();
      setTimeout(() => setNotification(null), 3000);
    },
    onError: () => {
      setNotification({
        type: 'error',
        message: 'Failed to mark attendance. Please try again.',
      });
    },
  });

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      classId: selectedClassId,
      date: new Date().toISOString().split('T')[0],
      attendance: [],
    },
  });

  const selectedClass = useMemo(
    () => classesData?.find((cls) => cls.id === selectedClassId),
    [classesData, selectedClassId]
  );

  const handleClassChange = (classId: string | number) => {
    const id = String(classId);
    setSelectedClassId(id);
    form.setValue('classId', id);
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    const currentAttendance = form.getValues('attendance');
    const existingIndex = currentAttendance.findIndex((a) => a.studentId === studentId);

    if (existingIndex >= 0) {
      currentAttendance[existingIndex].status = status as any;
    } else {
      currentAttendance.push({
        studentId,
        status: status as any,
        notes: '',
      });
    }

    form.setValue('attendance', currentAttendance);
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    const currentAttendance = form.getValues('attendance');
    const existingIndex = currentAttendance.findIndex((a) => a.studentId === studentId);

    if (existingIndex >= 0) {
      currentAttendance[existingIndex].notes = notes;
    }

    form.setValue('attendance', currentAttendance);
  };

  const onSubmit = (data: AttendanceFormData) => {
    if (data.attendance.length === 0) {
      setNotification({
        type: 'error',
        message: 'Please mark attendance for at least one student',
      });
      return;
    }

    markAttendanceMutation.mutate({
      classId: data.classId,
      date: data.date,
      attendance: data.attendance,
    });
  };

  if (classesLoading) {
    return (
      <PortalLayout title="Mark Attendance">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Mark Attendance">
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
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Select Class</h2>

            <Dropdown
              options={
                classesData?.map((cls) => ({
                  value: cls.id,
                  label: `${cls.name} (${cls.gradeLevel})`,
                })) || []
              }
              value={selectedClassId}
              onChange={handleClassChange}
              placeholder="Select a class"
            />

            {selectedClass && (
              <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-950">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {selectedClass.name} - {selectedClass.studentCount} students
                </p>
              </div>
            )}
          </div>
        </Card>

        {selectedClassId && (
          <Card>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Date
                </label>
                <input
                  type="date"
                  {...form.register('date')}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800"
                />
              </div>

              {studentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              ) : studentsData?.data && studentsData.data.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    Mark Attendance
                  </h3>
                  {studentsData.data.map((student) => (
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

                      <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <div className="flex gap-2">
                          {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleAttendanceChange(student.id, status)}
                              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                                form.getValues('attendance').find((a) => a.studentId === student.id)
                                  ?.status === status
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>

                        <input
                          type="text"
                          placeholder="Notes (optional)"
                          value={
                            form.getValues('attendance').find((a) => a.studentId === student.id)
                              ?.notes || ''
                          }
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                          className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                        />
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
                <Button type="submit" variant="primary" loading={markAttendanceMutation.isPending}>
                  Submit Attendance
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
};

export default AttendanceMarkingPage;
