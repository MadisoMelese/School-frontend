import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { SkeletonTable } from '@components/atoms/SkeletonTable';
import { apiClient } from '@services/api/client';
import { userService } from '@services/api/userService';

/**
 * Teachers Management Page
 * Allows admins to view, create, update, and delete teachers
 */

interface User {
  _id: string;
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  location?: {
    city?: string;
    country?: string;
  };
  avatar?: string;
  createdAt: string;
}

interface Teacher {
  _id: string;
  id: string;
  userId: string | User;
  teacherId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  department: string;
  qualification: string;
  status: string;
  phone?: string;
  address?: string;
  subject?: string;
  experience?: number;
  salary?: number;
  joinDate?: string;
}

interface FormData {
  userId: string;
  teacherId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
  subject: string;
  qualification: string;
  experience: string;
  salary: string;
  joinDate: string;
  status: string;
}

export const TeachersManagementPage: React.FC = () => {
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

  // User dropdown state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSortBy, setUserSortBy] = useState<'created' | 'name'>('created');
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('desc');

  const [formData, setFormData] = useState<FormData>({
    userId: '',
    teacherId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    address: '',
    subject: '',
    qualification: '',
    experience: '',
    salary: '',
    joinDate: '',
    status: 'active',
  });

  // Load teachers with filters
  const loadTeachers = async (searchVal = '', statusVal = '', pageVal = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchVal) params.append('search', searchVal);
      if (statusVal) params.append('status', statusVal);
      params.append('page', pageVal.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get(`/teachers?${params.toString()}`);
      const data = response.data.data;

      if (Array.isArray(data)) {
        setTeachers(data);
      } else if (data?.teachers) {
        setTeachers(data.teachers);
        setTotalPages(data.totalPages || 1);
      } else {
        setTeachers([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  // Load users for dropdown
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await userService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Filter and sort users for dropdown
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const searchLower = userSearchTerm.toLowerCase();
      return (
        user.firstname.toLowerCase().includes(searchLower) ||
        user.lastname.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    });

    // Sort users
    filtered.sort((a, b) => {
      let compareValue = 0;
      if (userSortBy === 'name') {
        const nameA = `${a.firstname} ${a.lastname}`.toLowerCase();
        const nameB = `${b.firstname} ${b.lastname}`.toLowerCase();
        compareValue = nameA.localeCompare(nameB);
      } else {
        // Sort by creation date
        compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return userSortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [users, userSearchTerm, userSortBy, userSortOrder]);

  // Load initial data
  useEffect(() => {
    loadTeachers(searchTerm, statusFilter, page);
    loadUsers();
  }, [page, limit]);

  // Handle user selection from dropdown
  const handleSelectUser = (user: User) => {
    setFormData((prev) => ({
      ...prev,
      userId: user.id || user._id,
      firstName: user.firstname,
      lastName: user.lastname,
      birthday: user.birthday || prev.birthday,
      gender: (user.gender as 'male' | 'female' | 'other') || prev.gender,
      avatar: user.avatar || prev.avatar,
      location: user.location?.city || prev.address,
    }));
    setShowUserDropdown(false);
    setUserSearchTerm('');
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle create teacher
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      // Validate required fields
      if (!formData.userId.trim()) {
        setError('User selection is required');
        return;
      }
      if (!formData.teacherId.trim()) {
        setError('Teacher ID is required');
        return;
      }
      if (!formData.dateOfBirth) {
        setError('Date of birth is required');
        return;
      }
      if (!formData.gender) {
        setError('Gender is required');
        return;
      }

      // Only send fields that are not empty
      const dataToSend: any = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '')
      );

      // Convert numeric fields to numbers
      if (dataToSend.experience && typeof dataToSend.experience === 'string') {
        dataToSend.experience = parseFloat(dataToSend.experience);
      }
      if (dataToSend.salary && typeof dataToSend.salary === 'string') {
        dataToSend.salary = parseFloat(dataToSend.salary);
      }

      await apiClient.post('/teachers', dataToSend);
      setSuccess('Teacher created successfully');
      setFormData({
        userId: '',
        teacherId: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'male',
        phone: '',
        address: '',
        subject: '',
        qualification: '',
        experience: '',
        salary: '',
        joinDate: '',
        status: 'active',
      });
      setShowForm(false);
      await loadTeachers(searchTerm, statusFilter, 1);
      setPage(1);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create teacher');
    }
  };

  // Handle edit teacher
  const handleEdit = (teacher: Teacher) => {
    setEditingId(teacher._id);
    setFormData({
      userId:
        typeof teacher.userId === 'string' ? teacher.userId : (teacher.userId as any)?.id || '',
      teacherId: teacher.teacherId || '',
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      dateOfBirth: teacher.dateOfBirth || '',
      gender: teacher.gender || 'male',
      phone: teacher.phone || '',
      address: teacher.address || '',
      subject: teacher.subject || '',
      qualification: teacher.qualification || '',
      experience: teacher.experience?.toString() || '',
      salary: teacher.salary?.toString() || '',
      joinDate: teacher.joinDate || '',
      status: teacher.status || 'active',
    });
    setShowForm(true);
  };

  // Handle update teacher
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      setError(null);
      // Only send fields that are not empty
      const dataToSend: any = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '')
      );

      // Remove immutable fields (userId and teacherId cannot be updated)
      delete dataToSend.userId;
      delete dataToSend.teacherId;

      // Convert numeric fields to numbers
      if (dataToSend.experience && typeof dataToSend.experience === 'string') {
        dataToSend.experience = parseFloat(dataToSend.experience);
      }
      if (dataToSend.salary && typeof dataToSend.salary === 'string') {
        dataToSend.salary = parseFloat(dataToSend.salary);
      }

      await apiClient.put(`/teachers/${editingId}`, dataToSend);
      setSuccess('Teacher updated successfully');
      setFormData({
        userId: '',
        teacherId: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'male',
        phone: '',
        address: '',
        subject: '',
        qualification: '',
        experience: '',
        salary: '',
        joinDate: '',
        status: 'active',
      });
      setEditingId(null);
      setShowForm(false);
      await loadTeachers(searchTerm, statusFilter, page);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update teacher');
    }
  };

  // Handle delete teacher
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;

    try {
      setError(null);
      await apiClient.delete(`/teachers/${id}`);
      setSuccess('Teacher deleted successfully');
      await loadTeachers(searchTerm, statusFilter, page);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete teacher');
    }
  };

  // Handle cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      userId: '',
      teacherId: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      phone: '',
      address: '',
      subject: '',
      qualification: '',
      experience: '',
      salary: '',
      joinDate: '',
      status: 'active',
    });
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
    loadTeachers(value, statusFilter, 1);
  };

  // Handle status filter
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    loadTeachers(searchTerm, value, 1);
  };

  return (
    <DashboardLayout title="Teachers Management" description="Manage all teachers in the system">
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
              Total Teachers: {teachers.length}
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} variant="primary">
              + Add Teacher
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
                  placeholder="Search teachers..."
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
                  <option value="suspended">Suspended</option>
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
              {editingId ? 'Edit Teacher' : 'Create New Teacher'}
            </h3>
            <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Selection Dropdown */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Select User *
                  </label>
                  <div className="relative">
                    <div
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                    >
                      {formData.userId
                        ? users.find((u) => u.id === formData.userId || u._id === formData.userId)
                            ? `${users.find((u) => u.id === formData.userId || u._id === formData.userId)?.firstname} ${users.find((u) => u.id === formData.userId || u._id === formData.userId)?.lastname} (${users.find((u) => u.id === formData.userId || u._id === formData.userId)?.email})`
                            : 'Select a user'
                        : 'Select a user'}
                    </div>

                    {showUserDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-lg z-10">
                        {/* Search and Sort Controls */}
                        <div className="p-3 border-b border-neutral-200 dark:border-neutral-600 space-y-2">
                          <Input
                            type="text"
                            placeholder="Search by name or email..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={userSortBy}
                              onChange={(e) => setUserSortBy(e.target.value as 'created' | 'name')}
                              className="px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white text-xs"
                            >
                              <option value="created">Sort by Created</option>
                              <option value="name">Sort by Name</option>
                            </select>
                            <select
                              value={userSortOrder}
                              onChange={(e) => setUserSortOrder(e.target.value as 'asc' | 'desc')}
                              className="px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white text-xs"
                            >
                              <option value="asc">Ascending</option>
                              <option value="desc">Descending</option>
                            </select>
                          </div>
                        </div>

                        {/* User List */}
                        <div className="max-h-64 overflow-y-auto">
                          {usersLoading ? (
                            <div className="p-3 text-neutral-600 dark:text-neutral-400 text-sm">
                              Loading users...
                            </div>
                          ) : filteredAndSortedUsers.length === 0 ? (
                            <div className="p-3 text-neutral-600 dark:text-neutral-400 text-sm">
                              No users found
                            </div>
                          ) : (
                            filteredAndSortedUsers.map((user) => (
                              <div
                                key={user._id}
                                onClick={() => handleSelectUser(user)}
                                className="px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer border-b border-neutral-100 dark:border-neutral-600 last:border-b-0"
                              >
                                <div className="font-medium text-neutral-900 dark:text-white text-sm">
                                  {user.firstname} {user.lastname}
                                </div>
                                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                  {user.email}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Teacher ID *
                  </label>
                  <Input
                    type="text"
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    placeholder="Enter teacher ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    First Name
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Auto-filled from user"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Auto-filled from user"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Date of Birth *
                  </label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Subject
                  </label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Enter subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Qualification
                  </label>
                  <Input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    placeholder="Enter qualification"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Experience (years)
                  </label>
                  <Input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Enter years of experience"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Salary
                  </label>
                  <Input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="Enter salary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Join Date
                  </label>
                  <Input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                  />
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
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Address
                  </label>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary">
                  {editingId ? 'Update Teacher' : 'Create Teacher'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Teachers List */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
          {loading && (
            <div className="p-6">
              <SkeletonTable rows={5} columns={7} showHeader />
            </div>
          )}
          {!loading && teachers.length === 0 && (
            <p className="p-6 text-neutral-600 dark:text-neutral-400">
              No teachers found. Create one to get started.
            </p>
          )}
          {!loading && teachers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Teacher ID
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Qualification
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
                  {teachers.map((teacher) => {
                    const userEmail =
                      typeof teacher.userId === 'string'
                        ? teacher.email
                        : (teacher.userId as User).email;
                    return (
                      <tr
                        key={teacher._id}
                        className="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                      >
                        <td className="px-4 py-3 text-neutral-900 dark:text-white">
                          {teacher.firstName} {teacher.lastName}
                        </td>
                        <td className="px-4 py-3 text-neutral-900 dark:text-white">{userEmail}</td>
                        <td className="px-4 py-3 text-neutral-900 dark:text-white">
                          {teacher.teacherId}
                        </td>
                        <td className="px-4 py-3 text-neutral-900 dark:text-white">
                          {teacher.department}
                        </td>
                        <td className="px-4 py-3 text-neutral-900 dark:text-white">
                          {teacher.qualification}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              teacher.status === 'active'
                                ? 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-200'
                                : teacher.status === 'on_leave'
                                  ? 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-200'
                                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                            }`}
                          >
                            {teacher.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEdit(teacher)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(teacher._id)}
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
        {!loading && teachers.length > 0 && totalPages > 1 && (
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

export default TeachersManagementPage;
