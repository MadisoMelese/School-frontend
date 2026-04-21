import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Button } from '@components/atoms/Button';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { apiClient } from '@services/api/client';
import { teacherService } from '@services/api/teacherService';

/**
 * Teacher Attendance Marking Page
 * Mark attendance for students in a class
 * Mobile-first responsive design with dark theme support
 */

interface Student {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  status: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export const AttendanceMarkingPage: React.FC = () => {
  const { id: classId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [className, setClassName] = useState('');

  // Load students
  useEffect(() => {
    const loadStudents = async () => {
      if (!classId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch class details
        const classResponse = await apiClient.get<{ data: { name: string } }>(`/classes/${classId}`);
        setClassName(classResponse.data.data?.name || 'Class');

        // Fetch students for this class
        const studentsResponse = await apiClient.get<{ data: { students: Student[] } }>(
          `/students?classId=${classId}&limit=100`
        );
        const studentsData = studentsResponse.data.data?.students || [];
        setStudents(Array.isArray(studentsData) ? studentsData : []);

        // Initialize attendance as all present
        const initialAttendance: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
        studentsData.forEach((student: Student) => {
          initialAttendance[student._id] = 'present';
        });
        setAttendance(initialAttendance);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [classId]);

  // Handle attendance change
  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Mark all as present
  const markAllPresent = () => {
    const newAttendance: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    students.forEach((student) => {
      newAttendance[student._id] = 'present';
    });
    setAttendance(newAttendance);
  };

  // Mark all as absent
  const markAllAbsent = () => {
    const newAttendance: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    students.forEach((student) => {
      newAttendance[student._id] = 'absent';
    });
    setAttendance(newAttendance);
  };

  // Submit attendance
  const handleSubmit = async () => {
    if (!classId) return;

    try {
      setSubmitting(true);
      setError(null);

      // Prepare attendance records
      const records: AttendanceRecord[] = students.map((student) => ({
        studentId: student._id,
        status: attendance[student._id] || 'present',
      }));

      // Submit attendance
      await teacherService.markAttendance({
        classId,
        date: selectedDate,
        records,
      });

      setSuccess('Attendance marked successfully!');
      setTimeout(() => {
        navigate('/teacher/classes');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: students.length,
    present: Object.values(attendance).filter((s) => s === 'present').length,
    absent: Object.values(attendance).filter((s) => s === 'absent').length,
    late: Object.values(attendance).filter((s) => s === 'late').length,
    excused: Object.values(attendance).filter((s) => s === 'excused').length,
  };

  if (loading) {
    return (
      <DashboardLayout title="Mark Attendance" description="Loading...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mark Attendance" description={`${className} - ${selectedDate}`}>
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

        {/* Date Selector and Quick Actions */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 sm:p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Attendance Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={markAllPresent}>
                Mark All Present
              </Button>
              <Button variant="secondary" size="sm" onClick={markAllAbsent}>
                Mark All Absent
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-success-50 dark:bg-success-950 rounded-lg p-4 border border-success-200 dark:border-success-900">
            <p className="text-sm text-success-700 dark:text-success-300 mb-1">Present</p>
            <p className="text-2xl font-bold text-success-900 dark:text-success-100">{stats.present}</p>
          </div>
          <div className="bg-danger-50 dark:bg-danger-950 rounded-lg p-4 border border-danger-200 dark:border-danger-900">
            <p className="text-sm text-danger-700 dark:text-danger-300 mb-1">Absent</p>
            <p className="text-2xl font-bold text-danger-900 dark:text-danger-100">{stats.absent}</p>
          </div>
          <div className="bg-warning-50 dark:bg-warning-950 rounded-lg p-4 border border-warning-200 dark:border-warning-900">
            <p className="text-sm text-warning-700 dark:text-warning-300 mb-1">Late</p>
            <p className="text-2xl font-bold text-warning-900 dark:text-warning-100">{stats.late}</p>
          </div>
          <div className="bg-info-50 dark:bg-info-950 rounded-lg p-4 border border-info-200 dark:border-info-900">
            <p className="text-sm text-info-700 dark:text-info-300 mb-1">Excused</p>
            <p className="text-2xl font-bold text-info-900 dark:text-info-100">{stats.excused}</p>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Students ({students.length})
            </h2>
          </div>

          {students.length === 0 ? (
            <div className="p-12 text-center">
              <Icon name="Users" size={48} className="text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">No students in this class</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {students.map((student) => (
                <div
                  key={student._id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {student.studentId}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleAttendanceChange(student._id, status)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          attendance[student._id] === status
                            ? status === 'present'
                              ? 'bg-success-600 text-white border-success-600'
                              : status === 'absent'
                              ? 'bg-danger-600 text-white border-danger-600'
                              : status === 'late'
                              ? 'bg-warning-600 text-white border-warning-600'
                              : 'bg-info-600 text-white border-info-600'
                            : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-600'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        {students.length > 0 && (
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate('/teacher/classes')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Icon name="Check" size={18} />
                  Submit Attendance
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AttendanceMarkingPage;
