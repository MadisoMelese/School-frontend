import React, { useState, useEffect } from 'react';
import { Modal } from '@components/molecules/Modal';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import type { CreateStudentRequest } from '@services/admin/studentService';
import { apiClient } from '@services/api/client';

interface StudentCreateFormProps {
  onSubmit: (data: CreateStudentRequest) => Promise<void>;
  onClose: () => void;
}

interface User {
  _id: string;
  id:string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
}

interface Class {
  _id: string;
  id:string;
  name: string;
  grade:string;
  section: string;
}

export const StudentCreateForm: React.FC<StudentCreateFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState<CreateStudentRequest>({
    userId: '',
    studentId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    address: '',
    classId: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        // Fetch users without student role
        const usersResponse = await apiClient.get('/users');
        const allUsers = usersResponse.data.data.users || [];
        
        // Filter users who don't have student role or are available
        const availableUsers = allUsers.filter((u: User) => u.role === 'student' || u.role === 'user');
        console.log("users", availableUsers)
        setUsers(availableUsers);

        // Fetch classes
        const classesResponse = await apiClient.get('/classes');
        const classesData = classesResponse.data.data;
        // Handle different response structures - API returns { classes, total, page, totalPages }
        const classList = Array.isArray(classesData) 
          ? classesData 
          : (Array.isArray(classesData?.classes) ? classesData.classes : []);
        setClasses(classList);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load users and classes');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.userId.trim()) {
      setError('User is required');
      setLoading(false);
      return;
    }

    if (!formData.studentId.trim()) {
      setError('Student ID is required');
      setLoading(false);
      return;
    }

    if (!formData.firstName.trim()) {
      setError('First name is required');
      setLoading(false);
      return;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      setLoading(false);
      return;
    }

    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      setLoading(false);
      return;
    }

    if (!formData.parentName.trim()) {
      setError('Parent name is required');
      setLoading(false);
      return;
    }

    if (!formData.parentPhone.trim()) {
      setError('Parent phone is required');
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create New Student"
      size="lg"
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading || loadingData}>
            {loading ? 'Creating...' : 'Create Student'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        {error && (
          <div className="bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-900 rounded-lg p-3">
            <p className="text-sm text-danger-700 dark:text-danger-200">{error}</p>
          </div>
        )}

        {loadingData && (
          <div className="text-center py-4">
            <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
          </div>
        )}

        {!loadingData && (
          <>
            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                User Account *
              </label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
                required
              >
                <option value="">Select User</option>
                {Array.isArray(users) && users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.firstname} {user.firstname} {user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Student ID *
              </label>
              <Input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Enter student ID"
                disabled={loading}
                required
              />
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                First Name *
              </label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                disabled={loading}
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Last Name *
              </label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                disabled={loading}
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Date of Birth *
              </label>
              <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Phone
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                disabled={loading}
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                disabled={loading}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Class
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              >
                <option value="">Select Class</option>
                {Array.isArray(classes) && classes.map((cls) => (
                  <option key={cls.id} value={cls._id}>
                    {cls.grade}-{cls.section}
                  </option>
                ))}
              </select>
            </div>

            {/* Parent Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Parent Name *
              </label>
              <Input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                placeholder="Enter parent name"
                disabled={loading}
                required
              />
            </div>

            {/* Parent Phone */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Parent Phone *
              </label>
              <Input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                placeholder="Enter parent phone"
                disabled={loading}
                required
              />
            </div>

            {/* Parent Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Parent Email
              </label>
              <Input
                type="email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                placeholder="Enter parent email"
                disabled={loading}
              />
            </div>

            {/* Enrollment Date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Enrollment Date
              </label>
              <Input
                type="date"
                name="enrollmentDate"
                value={formData.enrollmentDate}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

export default StudentCreateForm;
