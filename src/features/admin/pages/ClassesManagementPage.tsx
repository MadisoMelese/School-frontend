import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { SkeletonTable } from '@components/atoms/SkeletonTable';
import { apiClient } from '@services/api/client';

/**
 * Classes Management Page
 * Allows admins to view, create, update, and delete classes
 */

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Class {
  _id: string;
  id: string;
  name: string;
  section: string;
  grade: string;
  teacherId?: string | Teacher;
  students?: string[];
  capacity: number;
  academicYear: string;
  status: 'active' | 'inactive';
}

interface FormData {
  name: string;
  section: string;
  grade: string;
  teacherId: string;
  capacity: string;
  academicYear: string;
  status: 'active' | 'inactive';
}

export const ClassesManagementPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    section: '',
    grade: '',
    teacherId: '',
    capacity: '',
    academicYear: new Date().getFullYear().toString(),
    status: 'active',
  });

  // Load classes with filters
  const loadClasses = async (searchVal = '', statusVal = '', pageVal = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchVal) params.append('search', searchVal);
      if (statusVal) params.append('status', statusVal);
      params.append('page', pageVal.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get(`/classes?${params.toString()}`);
      const data = response.data.data;

      if (Array.isArray(data)) {
        setClasses(data);
      } else if (data?.classes) {
        setClasses(data.classes);
        setTotalPages(data.totalPages || 1);
      } else {
        setClasses([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  // Load teachers for dropdown
  const loadTeachers = async () => {
    try {
      const response = await apiClient.get('/teachers?limit=1000');
      const data = response.data.data;
      if (Array.isArray(data)) {
        setTeachers(data);
      } else if (data?.teachers) {
        setTeachers(data.teachers);
      }
    } catch (err) {
      console.error('Failed to load teachers:', err);
    }
  };

  useEffect(() => {
    loadClasses(searchTerm, statusFilter, page);
    loadTeachers();
  }, [page, limit]);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle create class
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      // Validate required fields
      if (!formData.name.trim()) {
        setError('Class name is required');
        return;
      }
      if (!formData.section.trim()) {
        setError('Section is required');
        return;
      }
      if (!formData.grade.trim()) {
        setError('Grade is required');
        return;
      }
      if (!formData.capacity) {
        setError('Capacity is required');
        return;
      }

      const dataToSend: any = {
        name: formData.name,
        section: formData.section,
        grade: formData.grade,
        capacity: parseInt(formData.capacity),
        academicYear: formData.academicYear,
        status: formData.status,
      };

      if (formData.teacherId) {
        dataToSend.teacherId = formData.teacherId;
      }

      await apiClient.post('/classes', dataToSend);
      setSuccess('Class created successfully');
      setFormData({
        name: '',
        section: '',
        grade: '',
        teacherId: '',
        capacity: '',
        academicYear: new Date().getFullYear().toString(),
        status: 'active',
      });
      setShowForm(false);
      await loadClasses(searchTerm, statusFilter, 1);
      setPage(1);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class');
    }
  };

  // Handle edit class
  const handleEdit = (cls: Class) => {
    setEditingId(cls._id);
    setFormData({
      name: cls.name || '',
      section: cls.section || '',
      grade: cls.grade || '',
      teacherId: typeof cls.teacherId === 'string' ? cls.teacherId : (cls.teacherId as any)?._id || '',
      capacity: cls.capacity?.toString() || '',
      academicYear: cls.academicYear || new Date().getFullYear().toString(),
      status: cls.status || 'active',
    });
    setShowForm(true);
  };

  // Handle update class
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      setError(null);
      const dataToSend: any = {
        name: formData.name,
        section: formData.section,
        grade: formData.grade,
        capacity: parseInt(formData.capacity),
        academicYear: formData.academicYear,
        status: formData.status,
      };

      if (formData.teacherId) {
        dataToSend.teacherId = formData.teacherId;
      }

      await apiClient.put(`/classes/${editingId}`, dataToSend);
      setSuccess('Class updated successfully');
      setFormData({
        name: '',
        section: '',
        grade: '',
        teacherId: '',
        capacity: '',
        academicYear: new Date().getFullYear().toString(),
        status: 'active',
      });
      setEditingId(null);
      setShowForm(false);
      await loadClasses(searchTerm, statusFilter, page);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update class');
    }
  };

  // Handle delete class
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;

    try {
      setError(null);
      await apiClient.delete(`/classes/${id}`);
      setSuccess('Class deleted successfully');
      await loadClasses(searchTerm, statusFilter, page);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete class');
    }
  };

  // Handle cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      section: '',
      grade: '',
      teacherId: '',
      capacity: '',
      academicYear: new Date().getFullYear().toString(),
      status: 'active',
    });
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
    loadClasses(value, statusFilter, 1);
  };

  // Handle status filter
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    loadClasses(searchTerm, value, 1);
  };

  return (
    <DashboardLayout title="Classes Management" description="Manage all classes in the system">
      <div className="space-y-6">
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

        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Total Classes: {classes.length}
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} variant="primary">
              + Add Class
            </Button>
          )}
        </div>

        {/* Search and Filter */}
        {!showForm && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Search by Name
                </label>
                <Input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Items per Page
                </label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              {editingId ? 'Edit Class' : 'Create New Class'}
            </h3>
            <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Class Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter class name (e.g., Class A)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Section *
                  </label>
                  <Input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    placeholder="Enter section (e.g., A, B, C)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Grade *
                  </label>
                  <Input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    placeholder="Enter grade (e.g., 10, 11, 12)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Capacity *
                  </label>
                  <Input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Enter class capacity"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Academic Year *
                  </label>
                  <Input
                    type="text"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    placeholder="Enter academic year (e.g., 2024-2025)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Assign Teacher
                  </label>
                  <select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary">
                  {editingId ? 'Update Class' : 'Create Class'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Classes List */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
          {loading && (
            <div className="p-6">
              <SkeletonTable rows={5} columns={6} showHeader />
            </div>
          )}
          {!loading && classes.length === 0 && (
            <p className="p-6 text-neutral-600 dark:text-neutral-400">
              No classes found. Create one to get started.
            </p>
          )}
          {!loading && classes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Section
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Teacher
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => {
                    const teacherName =
                      typeof cls.teacherId === 'string'
                        ? 'Unassigned'
                        : cls.teacherId
                          ? `${(cls.teacherId as Teacher).firstName} ${(cls.teacherId as Teacher).lastName}`
                          : 'Unassigned';
                    return (
                      <tr
                        key={cls._id}
                        className="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                      >
                        <td className="px-4 py-3 text-neutral-900 dark:text-white">{cls.name}</td>
                        <td className="px-4 py-3 text-neutral-900 dark:text-white">{cls.section}</td>
                        <td className="px-4 py-3 text-neutral-900 dark:text-white">{cls.grade}</td>
                        <td className="px-4 py-3 text-neutral-900 dark:text-white">{teacherName}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              cls.status === 'active'
                                ? 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-200'
                                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                            }`}
                          >
                            {cls.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEdit(cls)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(cls._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && classes.length > 0 && totalPages > 1 && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4 flex items-center justify-between">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClassesManagementPage;
