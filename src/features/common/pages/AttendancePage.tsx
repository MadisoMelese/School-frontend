import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Button } from '@components/atoms/Button';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { apiClient } from '@services/api/client';
import { useAuth } from '@hooks/useAuth';

/**
 * Unified Attendance Page
 * Works for all roles based on their privileges:
 * - Teacher: Mark attendance for their classes
 * - Student: View their own attendance
 * - Parent: View their child's attendance
 * - Admin: View/manage all attendance
 * 
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
  _id: string;
  studentId: Student | string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  createdAt: string;
}

interface ClassInfo {
  _id: string;
  name: string;
  section: string;
  grade: string;
}

type ViewMode = 'view' | 'mark';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get role-specific params
  const childId = searchParams.get('childId');
  const classIdParam = searchParams.get('classId');
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(classIdParam || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Determine role and view mode
  const role = user?.role || 'user';
  const canMarkAttendance = role === 'teacher' || role === 'admin';
  const viewMode: ViewMode = canMarkAttendance && !childId ? 'mark' : 'view';
  
  // Determine whose attendance to show
  const targetUserId = childId || (role === 'student' ? user?.id : null);

  // Load classes for teachers/admins
  useEffect(() => {
    if (viewMode === 'mark') {
      const loadClasses = async () => {
        try {
          const response = await apiClient.get<{ data: { classes: ClassInfo[] } }>('/classes?limit=100');
          const classesData = response.data.data?.classes || [];
          setClasses(Array.isArray(classesData) ? classesData : []);
          if (classesData.length > 0 && !selectedClass) {
            setSelectedClass(classesData[0]._id);
          }
        } catch (err) {
          console.error('Failed to load classes:', err);
        }
      };
      loadClasses();
    }
  }, [viewMode]);

  // Load students for selected class (teacher/admin marking)
  useEffect(() => {
    if (viewMode === 'mark' && selectedClass) {
      const loadStudents = async () => {
        try {
          setLoading(true);
          setError(null);
          
          let studentsData: Student[] = [];
          
          if (role === 'teacher') {
            // Teachers use their assigned class students
            const response = await apiClient.get<{ 
              data: { 
                class: ClassInfo;
                students: Student[];
              } 
            }>(`/teachers/me/class-students`);
            
            studentsData = response.data.data?.students || [];
          } else if (role === 'admin') {
            // Admins select a class and get students from that class
            const response = await apiClient.get<{ 
              data: {
                _id: string;
                name: string;
                section: string;
                grade: string;
                students: Student[];
              } 
            }>(`/classes/${selectedClass}`);
            
            studentsData = response.data.data?.students || [];
          }
          
          setStudents(Array.isArray(studentsData) ? studentsData : []);
          
          // Initialize attendance as all present
          const initialAttendance: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
          studentsData.forEach((s: Student) => {
            initialAttendance[s._id] = 'present';
          });
          setAttendance(initialAttendance);
        } catch (err) {
          console.error('Failed to load students:', err);
          setError('Failed to load students');
        } finally {
          setLoading(false);
        }
      };
      loadStudents();
    }
  }, [viewMode, selectedClass, role]);

  // Load attendance records for viewing (student/parent)
  useEffect(() => {
    if (viewMode === 'view' && targetUserId) {
      const loadAttendance = async () => {
        try {
          setLoading(true);
          const [year, month] = selectedMonth.split('-');
          const response = await apiClient.get<{ 
            data: { 
              attendance: AttendanceRecord[];
              total: number;
            } 
          }>(`/attendance?studentId=${targetUserId}&month=${month}&year=${year}&limit=100`);
          
          const records = response.data.data?.attendance || [];
          setAttendanceRecords(Array.isArray(records) ? records : []);
        } catch (err) {
          console.error('Failed to load attendance:', err);
          setError('Failed to load attendance records');
        } finally {
          setLoading(false);
        }
      };
      loadAttendance();
    }
  }, [viewMode, targetUserId, selectedMonth]);

  // Mark all as present/absent
  const markAll = (status: 'present' | 'absent') => {
    const newAttendance: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    students.forEach(s => {
      newAttendance[s._id] = status;
    });
    setAttendance(newAttendance);
  };

  // Save attendance
  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedDate) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const records = students.map(s => ({
        studentId: s._id,
        status: attendance[s._id] || 'present',
      }));
      
      // Backend expects classId, teacherId, date at top level
      const payload = {
        classId: selectedClass,
        teacherId: 'me', // Backend will resolve 'me' to the actual teacher ID
        date: selectedDate,
        records,
      };
      
      await apiClient.post('/attendance/bulk', payload);
      
      alert('Attendance saved successfully!');
    } catch (err) {
      console.error('Failed to save attendance:', err);
      setError('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Calculate summary for view mode
  const summary = useMemo(() => {
    if (viewMode === 'mark') return null;
    
    return {
      present: attendanceRecords.filter(a => a.status === 'present').length,
      absent: attendanceRecords.filter(a => a.status === 'absent').length,
      late: attendanceRecords.filter(a => a.status === 'late').length,
      excused: attendanceRecords.filter(a => a.status === 'excused').length,
    };
  }, [viewMode, attendanceRecords]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'danger';
      case 'late': return 'warning';
      case 'excused': return 'info';
      default: return 'neutral';
    }
  };

  // Render marking view (teacher/admin)
  if (viewMode === 'mark') {
    return (
      <DashboardLayout title="Mark Attendance" description="Record student attendance">
        <div className="space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-900 rounded-lg p-4">
              <p className="text-danger-700 dark:text-danger-200">{error}</p>
            </div>
          )}

          {/* Class and Date Selection */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 sm:p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Select Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                >
                  <option value="">Select a class...</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} - {cls.section} (Grade {cls.grade})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-12 text-center border border-neutral-200 dark:border-neutral-700">
              <Icon name="Users" size={48} className="text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">No students in this class</p>
            </div>
          ) : (
            <>
              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => markAll('present')}>
                  Mark All Present
                </Button>
                <Button variant="secondary" size="sm" onClick={() => markAll('absent')}>
                  Mark All Absent
                </Button>
              </div>

              {/* Students List */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 dark:bg-neutral-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">Student ID</th>
                        <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student._id} className="border-t border-neutral-200 dark:border-neutral-700">
                          <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">
                            {student.studentId}
                          </td>
                          <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={attendance[student._id] || 'present'}
                              onChange={(e) => setAttendance({ ...attendance, [student._id]: e.target.value as any })}
                              className="px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="late">Late</option>
                              <option value="excused">Excused</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button variant="primary" onClick={handleSaveAttendance} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Render view mode (student/parent)
  return (
    <DashboardLayout 
      title={role === 'parent' ? "Child's Attendance" : "My Attendance"} 
      description="View attendance records"
    >
      <div className="space-y-4 sm:space-y-6">
        {error && (
          <div className="bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-900 rounded-lg p-4">
            <p className="text-danger-700 dark:text-danger-200">{error}</p>
          </div>
        )}

        {/* Month Selector */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 sm:p-6 border border-neutral-200 dark:border-neutral-700">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Select Month
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Summary */}
            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-success-50 dark:bg-success-950 rounded-lg p-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Present</p>
                  <p className="text-2xl font-bold text-success-600 dark:text-success-400">{summary.present}</p>
                </div>
                <div className="bg-danger-50 dark:bg-danger-950 rounded-lg p-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Absent</p>
                  <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">{summary.absent}</p>
                </div>
                <div className="bg-warning-50 dark:bg-warning-950 rounded-lg p-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Late</p>
                  <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">{summary.late}</p>
                </div>
                <div className="bg-info-50 dark:bg-info-950 rounded-lg p-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Excused</p>
                  <p className="text-2xl font-bold text-info-600 dark:text-info-400">{summary.excused}</p>
                </div>
              </div>
            )}

            {/* Attendance Records */}
            {attendanceRecords.length === 0 ? (
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-12 text-center border border-neutral-200 dark:border-neutral-700">
                <Icon name="Calendar" size={48} className="text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">No attendance records for this month</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 dark:bg-neutral-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((record) => (
                        <tr key={record._id} className="border-t border-neutral-200 dark:border-neutral-700">
                          <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={getStatusColor(record.status)}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                            {record.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;
{}