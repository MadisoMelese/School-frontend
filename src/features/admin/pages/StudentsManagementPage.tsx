import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { Badge } from '@components/atoms/Badge';
import { useStudents } from '../hooks/useStudents';
import { StudentCreateForm } from '../components/StudentCreateForm';
import { StudentEditForm } from '../components/StudentEditForm';
import { StudentDetailsModal } from '../components/StudentDetailsModal';
import type { Student } from '@services/admin/studentService';
import { Trash2, Edit, Eye, Plus, Search } from 'lucide-react';

/**
 * Students Management Page
 * Allows admins to view, create, update, and delete students
 */

export const StudentsManagementPage: React.FC = () => {
  useAuth();
  const {
    students,
    total,
    page,
    totalPages,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  } = useStudents();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents({ page: 1, limit: 20 });
  }, [fetchStudents]);

  const handleSearch = () => {
    fetchStudents({
      search: searchQuery,
      status: statusFilter || undefined,
      page: 1,
      limit: 20,
    });
  };

  const handleCreateStudent = async (data: any) => {
    try {
      await createStudent(data);
      setShowCreateModal(false);
      alert('Student created successfully!');
    } catch (err) {
      console.error('Failed to create student:', err);
    }
  };

  const handleUpdateStudent = async (data: any) => {
    if (!selectedStudent) return;
    try {
      await updateStudent(selectedStudent._id, data);
      setShowEditModal(false);
      setSelectedStudent(null);
      alert('Student updated successfully!');
    } catch (err) {
      console.error('Failed to update student:', err);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (deleteConfirm !== studentId) {
      setDeleteConfirm(studentId);
      return;
    }

    try {
      await deleteStudent(studentId);
      setDeleteConfirm(null);
      setShowDetailsModal(false);
      setSelectedStudent(null);
      alert('Student deleted successfully!');
    } catch (err) {
      console.error('Failed to delete student:', err);
      alert('Failed to delete student');
    }
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'suspended':
        return 'danger';
      case 'graduated':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchStudents({
      search: searchQuery || undefined,
      status: statusFilter || undefined,
      page: newPage,
      limit: 20,
    });
  };

  return (
    <DashboardLayout title="Students Management" description="Manage all students in the system">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow">
        {/* Header with Actions */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Students
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Total: {total} students
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add Student
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search by name or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                size={20}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="graduated">Graduated</option>
            </select>
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <p className="text-neutral-600 dark:text-neutral-400 text-center py-8">
              Loading students...
            </p>
          )}
          {error && (
            <p className="text-danger-600 dark:text-danger-200 text-center py-8">Error: {error}</p>
          )}
          {!loading && !error && students.length === 0 && (
            <p className="text-neutral-600 dark:text-neutral-400 text-center py-8">
              No students found
            </p>
          )}
          {!loading && !error && students.length > 0 && (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-neutral-900 dark:text-neutral-300 font-semibold">
                        Student ID
                      </th>
                      <th className="px-4 py-3 text-left text-neutral-900 dark:text-neutral-300 font-semibold">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-neutral-900 dark:text-neutral-300 font-semibold">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-neutral-900 dark:text-neutral-300 font-semibold">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-neutral-900 dark:text-neutral-300 font-semibold">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-neutral-900 dark:text-neutral-300 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr
                        key={student._id}
                        className="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                      >
                        <td className="px-4 py-3 text-neutral-900 dark:text-white">
                          {student.studentId}
                        </td>
                        <td className="px-4 py-3 text-neutral-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                          {student.userId?.email || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-neutral-900 dark:text-white">
                          {student.classId
                            ? `${student.classId.grade}-${student.classId.section}`
                            : 'Not Assigned'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusColor(student.status)}>
                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="p-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(student)}
                              className="p-1 text-warning-600 hover:text-warning-700 dark:text-warning-400 dark:hover:text-warning-300"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student._id)}
                              className={`p-1 ${
                                deleteConfirm === student._id
                                  ? 'text-danger-700 dark:text-danger-300'
                                  : 'text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300'
                              }`}
                              title={
                                deleteConfirm === student._id
                                  ? 'Click again to confirm'
                                  : 'Delete'
                              }
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {students.map((student) => (
                  <div
                    key={student._id}
                    className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {student.studentId}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(student.status)}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm mb-3">
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Email: {student.userId?.email || 'N/A'}
                      </p>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Class:{' '}
                        {student.classId
                          ? `${student.classId.name} - ${student.classId.section}`
                          : 'Not Assigned'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewDetails(student)}
                        className="flex-1"
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(student)}
                        className="flex-1"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteStudent(student._id)}
                        className="flex-1"
                      >
                        <Trash2 size={16} className="mr-1" />
                        {deleteConfirm === student._id ? 'Confirm?' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <StudentCreateForm
          onSubmit={handleCreateStudent}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      {showEditModal && selectedStudent && (
        <StudentEditForm
          student={selectedStudent}
          onSubmit={handleUpdateStudent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
      {showDetailsModal && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedStudent(null);
            setDeleteConfirm(null);
          }}
          onEdit={() => {
            setShowDetailsModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => handleDeleteStudent(selectedStudent._id)}
        />
      )}
    </DashboardLayout>
  );
};

export default StudentsManagementPage;
